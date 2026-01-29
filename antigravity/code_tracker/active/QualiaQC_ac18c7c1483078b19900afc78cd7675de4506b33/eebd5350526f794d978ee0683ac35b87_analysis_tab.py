Ö1import tkinter as tk
from tkinter import ttk

class AnalysisTab(ttk.Frame):
    def __init__(self, master, app):
        super().__init__(master)
        self.app = app
        self._build_ui()

    def _build_ui(self):
        # Create a scrollable container for settings
        canvas = tk.Canvas(self)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # --- 1. Project Selection ---
        project_frame = tk.LabelFrame(self.scrollable_frame, text="Project & Input")
        project_frame.pack(fill=tk.X, pady=5, padx=5)
        
        tk.Label(project_frame, text="Project Name:").grid(row=0, column=0, sticky="w", padx=5)
        self.project_combobox = ttk.Combobox(project_frame, textvariable=self.app.project_var, values=self.app.available_projects)
        self.project_combobox.grid(row=0, column=1, sticky="ew", padx=5, pady=5)
        
        tk.Button(project_frame, text="Select Image", command=self.app.select_image).grid(row=1, column=0, columnspan=2, sticky="ew", padx=5, pady=2)
        tk.Label(project_frame, textvariable=self.app.image_path_var, wraplength=500, foreground="blue").grid(row=2, column=0, columnspan=2, sticky="w", padx=5)

        # --- 2. Metadata ---
        meta_frame = tk.LabelFrame(self.scrollable_frame, text="Metadata Overrides")
        meta_frame.pack(fill=tk.X, pady=5, padx=5)
        
        tk.Label(meta_frame, text="Part Number:").grid(row=0, column=0, sticky="w", padx=5)
        tk.Entry(meta_frame, textvariable=self.app.part_number_var).grid(row=0, column=1, sticky="ew", padx=5, pady=2)
        
        tk.Label(meta_frame, text="Thickness:").grid(row=1, column=0, sticky="w", padx=5)
        tk.Entry(meta_frame, textvariable=self.app.thickness_var).grid(row=1, column=1, sticky="ew", padx=5, pady=2)
        
        tk.Label(meta_frame, text="Author:").grid(row=2, column=0, sticky="w", padx=5)
        tk.Entry(meta_frame, textvariable=self.app.author_var).grid(row=2, column=1, sticky="ew", padx=5, pady=2)
        
        meta_frame.columnconfigure(1, weight=1)

        # --- 3. Color Correction ---
        cc_frame = tk.LabelFrame(self.scrollable_frame, text="Color Correction")
        cc_frame.pack(fill=tk.X, pady=5, padx=5)
        
        tk.Checkbutton(cc_frame, text="Enable Color Alignment", variable=self.app.color_alignment_var).grid(row=0, column=0, columnspan=2, sticky="w")
        
        tk.Label(cc_frame, text="Method:").grid(row=1, column=0, sticky="w", padx=5)
        ttk.Combobox(cc_frame, textvariable=self.app.color_correction_method_var, values=["linear", "polynomial", "hsv", "histogram"]).grid(row=1, column=1, sticky="ew", padx=5)
        
        tk.Button(cc_frame, text="Select Sample Checker (Optional)", command=self.app.select_color_checker).grid(row=2, column=0, columnspan=2, sticky="ew", padx=5, pady=2)
        tk.Label(cc_frame, textvariable=self.app.color_checker_path_var, wraplength=500, font=("Arial", 8), foreground="gray").grid(row=3, column=0, columnspan=2, sticky="w", padx=5)
        
        cc_frame.columnconfigure(1, weight=1)

        # --- 4. Alignment & Masking ---
        align_frame = tk.LabelFrame(self.scrollable_frame, text="Alignment & Masking")
        align_frame.pack(fill=tk.X, pady=5, padx=5)
        
        tk.Checkbutton(align_frame, text="ArUco Alignment", variable=self.app.alignment_var).grid(row=0, column=0, sticky="w")
        tk.Checkbutton(align_frame, text="Object Alignment", variable=self.app.object_alignment_var).grid(row=0, column=1, sticky="w")
        
        tk.Label(align_frame, text="Shadow Removal:").grid(row=1, column=0, sticky="w", padx=5)
        ttk.Combobox(align_frame, textvariable=self.app.object_alignment_shadow_removal_var, values=["clahe", "gamma", "none"]).grid(row=1, column=1, sticky="ew", padx=5)
        
        tk.Checkbutton(align_frame, text="Apply Drawing Mask", variable=self.app.apply_mask_var).grid(row=2, column=0, sticky="w")
        tk.Checkbutton(align_frame, text="Treat White as Background", variable=self.app.mask_bg_is_white_var).grid(row=2, column=1, sticky="w")
        
        tk.Label(align_frame, text="Masking Order:").grid(row=3, column=0, sticky="w", padx=5)
        tk.Entry(align_frame, textvariable=self.app.masking_order_var).grid(row=3, column=1, sticky="ew", padx=5)
        
        align_frame.columnconfigure(1, weight=1)

        # --- 5. Analysis Options ---
        analysis_frame = tk.LabelFrame(self.scrollable_frame, text="Analysis & Processing")
        analysis_frame.pack(fill=tk.X, pady=5, padx=5)
        
        tk.Checkbutton(analysis_frame, text="Gaussian Blur", variable=self.app.blur_var).grid(row=0, column=0, sticky="w")
        
        tk.Checkbutton(analysis_frame, text="Aggregate Matched Pixels", variable=self.app.aggregate_var).grid(row=1, column=0, sticky="w")
        
        # Aggregation parameters (visible always, but used if aggregate is checked)
        agg_sub = ttk.Frame(analysis_frame)
        agg_sub.grid(row=2, column=0, columnspan=2, sticky="ew", padx=20)
        
        tk.Label(agg_sub, text="Kernel:").pack(side="left")
        tk.Entry(agg_sub, textvariable=self.app.agg_kernel_size_var, width=5).pack(side="left", padx=5)
        tk.Label(agg_sub, text="Min Area:").pack(side="left")
        tk.Entry(agg_sub, textvariable=self.app.agg_min_area_var, width=8).pack(side="left", padx=5)
        tk.Label(agg_sub, text="Density:").pack(side="left")
        tk.Entry(agg_sub, textvariable=self.app.agg_density_thresh_var, width=5).pack(side="left", padx=5)

        tk.Checkbutton(analysis_frame, text="Symmetry Analysis", variable=self.app.symmetry_var).grid(row=3, column=0, sticky="w")

        # --- Action ---
        tk.Button(self.scrollable_frame, text="START FULL ANALYSIS", command=self.app.run_analysis, height=2, bg="#4caf50", fg="white", font=("Arial", 10, "bold")).pack(fill=tk.X, pady=20, padx=10)
Ö1"(ac18c7c1483078b19900afc78cd7675de4506b332Mfile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/gui/tabs/analysis_tab.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC