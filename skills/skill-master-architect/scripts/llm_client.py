"""Generic LLM client for skill optimization.

Wraps different providers (Anthropic, Gemini, OpenAI) behind a common interface.
"""

import os
import json


class LLMClient:
    """Base class for LLM clients."""

    def complete(self, prompt: str, model: str, system_prompt: str = "") -> str:
        """Get a completion from the LLM."""
        raise NotImplementedError


class AnthropicClient(LLMClient):
    """Client for Anthropic API."""

    def __init__(self, api_key: str | None = None):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key)

    def complete(self, prompt: str, model: str, system_prompt: str = "") -> str:
        response = self.client.messages.create(
            model=model,
            max_tokens=4000,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text


class GeminiClient(LLMClient):
    """Client for Gemini API."""

    def __init__(self, api_key: str | None = None):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key or os.environ.get("GOOGLE_API_KEY"))
            self.genai = genai
        except ImportError:
            raise ImportError("Please install 'google-generativeai' or use 'gemini' provider with the CLI client.")

    def complete(self, prompt: str, model: str, system_prompt: str = "") -> str:
        model_instance = self.genai.GenerativeModel(
            model_name=model,
            system_instruction=system_prompt if system_prompt else None
        )
        response = model_instance.generate_content(prompt)
        return response.text


class DirectCLIClient(LLMClient):
    """Client that uses the 'gemini' CLI command directly for completions."""

    def __init__(self):
        # Verify gemini is in path
        import subprocess
        try:
            subprocess.run(["gemini", "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass  # We'll just try to use it and see if it fails later

    def complete(self, prompt: str, model: str, system_prompt: str = "") -> str:
        import subprocess
        import tempfile
        from pathlib import Path

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        # Use shell=True on Windows to find .cmd/.ps1 scripts
        import platform
        use_shell = platform.system() == "Windows"

        try:
            # We use --prompt and --approval-mode plan for a clean, non-interactive run
            cmd = ["gemini", "--prompt", full_prompt, "--approval-mode", "plan"]
            if model:
                cmd.extend(["--model", model])
            
            # Using --prompt with large strings might hit CLI limits on Windows.
            # However, the help says: "Appended to input on stdin (if any)."
            # So we can pipe the prompt via stdin.
            result = subprocess.run(
                ["gemini", "--prompt", "", "--approval-mode", "plan"] + (["--model", model] if model else []),
                input=full_prompt,
                capture_output=True,
                text=True,
                check=True,
                encoding='utf-8',
                shell=use_shell
            )
            
            # The output might contain ANSI codes or preamble.
            # Gemini CLI output is usually the model's response.
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            # Fallback to direct prompt if stdin fails for some reason
            try:
                result = subprocess.run(
                    ["gemini", "--prompt", full_prompt, "--approval-mode", "plan"] + (["--model", model] if model else []),
                    capture_output=True,
                    text=True,
                    check=True,
                    encoding='utf-8',
                    shell=use_shell
                )
                return result.stdout.strip()
            except Exception:
                raise e


def get_llm_client() -> LLMClient:
    """Factory to get the configured LLM client."""
    provider = os.environ.get("LLM_PROVIDER", "").lower()
    
    # Auto-detect if we're in a Gemini CLI environment
    is_gemini_cli = False
    import subprocess
    import shutil
    
    # Check common names on Windows/Unix
    for cmd in ["gemini", "gemini.cmd", "gemini.exe"]:
        if shutil.which(cmd):
            is_gemini_cli = True
            break
            
    # Fallback: try running it
    if not is_gemini_cli:
        try:
            subprocess.run(["gemini", "--version"], capture_output=True, check=True, shell=True)
            is_gemini_cli = True
        except:
            pass

    if provider == "gemini":
        try:
            return GeminiClient()
        except ImportError:
            if is_gemini_cli:
                return DirectCLIClient()
            raise
    elif provider == "cli" or (not provider and is_gemini_cli):
        return DirectCLIClient()
    elif provider == "openai":
        raise NotImplementedError("OpenAI client not implemented yet")
    else:
        # Fallback logic
        try:
            # If provider is explicitly 'anthropic' or not set, try it first
            if not provider or provider == "anthropic":
                try:
                    return AnthropicClient()
                except (ImportError, ModuleNotFoundError):
                    pass
            
            # If anthropic failed or provider is something else, try CLI if available
            if is_gemini_cli:
                return DirectCLIClient()
            
            # Last ditch: try Gemini library
            return GeminiClient()
        except (ImportError, ModuleNotFoundError):
            raise ImportError("No LLM client could be initialized. Please install 'anthropic' or 'google-generativeai', or ensure 'gemini' CLI is in your PATH.")
