import os
import glob
import shutil

def consolidate_patches_and_cleanup():
    # Define directory and output filename
    dir_path = os.path.dirname(os.path.realpath(__file__))
    output_file = os.path.join(dir_path, 'consolidated_patch.py')

    # Find files with 'patch' in the name and .py extension, but not consolidated_patch.py itself
    patch_files = [f for f in glob.glob(os.path.join(dir_path, '*patch*.py'))
                   if os.path.basename(f) != 'consolidated_patch.py']

    # Consolidate their contents
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for patch_file in patch_files:
            with open(patch_file, 'r', encoding='utf-8') as infile:
                outfile.write(f"# >>> START OF {os.path.basename(patch_file)} <<<\n")
                outfile.write(infile.read())
                outfile.write(f"\n# >>> END OF {os.path.basename(patch_file)} <<<\n\n")

    # Optionally: make this the 'active' patch
    # This could mean importing/referencing it or marking it as such in your system. Here's a stub:
    print(f"Consolidated patch created at: {output_file}")
    # If you have a way to "activate", call it here.

    # Delete patch_*.txt files in the same directory
    for txt_file in glob.glob(os.path.join(dir_path, 'patch_*.txt')):
        try:
            os.remove(txt_file)
            print(f"Deleted: {txt_file}")
        except Exception as e:
            print(f"Error deleting {txt_file}: {e}")

# Automatically run at import/runtime
consolidate_patches_and_cleanup()