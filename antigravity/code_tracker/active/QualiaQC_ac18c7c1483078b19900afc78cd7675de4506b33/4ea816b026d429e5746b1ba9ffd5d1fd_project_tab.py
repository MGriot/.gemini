õimport tkinter as tk
from tkinter import ttk, scrolledtext
from src.project_management.creation import create_project

class ProjectTab(ttk.Frame):
    def __init__(self, master, app):
        super().__init__(master)
        self.app = app
        self._build_ui()

    def _build_ui(self):
        # 1. Creation Frame
        f_create = tk.LabelFrame(self, text="New Project")
        f_create.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(f_create, text="Name:").pack(side=tk.LEFT, padx=5)
        tk.Entry(f_create, textvariable=self.app.new_project_name_var).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=5)
        tk.Button(f_create, text="Create", command=self.handle_create_project).pack(side=tk.LEFT, padx=5)
        
        # 2. Deletion Frame
        f_delete = tk.LabelFrame(self, text="Delete Project")
        f_delete.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(f_delete, text="Select:").pack(side=tk.LEFT, padx=5)
        self.del_combobox = ttk.Combobox(f_delete, values=self.app.available_projects, state="readonly")
        self.del_combobox.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=5)
        tk.Button(f_delete, text="DELETE PERMANENTLY", command=self.handle_delete_project, bg="#f44336", fg="white").pack(side=tk.LEFT, padx=5)

        # 3. Logs
        tk.Label(self, text="Activity Log:").pack(anchor="w", padx=10)
        self.log_proj = scrolledtext.ScrolledText(self, height=10)
        self.log_proj.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

    def handle_create_project(self):
        name = self.app.new_project_name_var.get()
        if name:
            msgs = self.app.project_manager.create_project(name)
            self.log_proj.insert(tk.END, "\n".join(msgs) + "\n")
            self._refresh_app_projects()

    def handle_delete_project(self):
        name = self.del_combobox.get()
        if not name:
            tk.messagebox.showwarning("Warning", "Please select a project to delete.")
            return
            
        if tk.messagebox.askyesno("Confirm Deletion", f"ARE YOU SURE? This will permanently delete project '{name}', including ALL its images, configurations, and history records."):
            msgs = self.app.project_manager.delete_project(name)
            self.log_proj.insert(tk.END, "\n".join(msgs) + "\n")
            self._refresh_app_projects()

    def _refresh_app_projects(self):
        """Refreshes project lists across all tabs."""
        self.app.available_projects = self.app.project_manager.list_projects()
        self.app.tab_analysis.project_combobox['values'] = self.app.available_projects
        self.app.tab_dataset.cb_dataset['values'] = self.app.available_projects
        self.del_combobox['values'] = self.app.available_projects
        self.del_combobox.set('') # Clear selection
õ"(ac18c7c1483078b19900afc78cd7675de4506b332Lfile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/gui/tabs/project_tab.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC