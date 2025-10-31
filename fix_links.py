#!/usr/bin/env python3
"""
Script to convert absolute GitHub Pages URLs to relative links.
This makes the website work on both GitHub Pages and Hostinger VPS.

Author: Claude Code
Date: October 31, 2025
"""

import os
import re
import sys
from pathlib import Path

# Base URL to replace
GITHUB_BASE_URL = "https://jawnlam.github.io/ExitReadyAdvisors/"

def get_all_html_files(root_dir):
    """Find all HTML files in the repository."""
    html_files = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    return sorted(html_files)

def calculate_relative_path(file_path, target_path, root_dir):
    """
    Calculate the relative path from one file to another.

    Args:
        file_path: The file containing the link
        target_path: The target file being linked to
        root_dir: The root directory of the repository

    Returns:
        The relative path from file_path to target_path
    """
    # Get the directory of the source file
    source_dir = os.path.dirname(file_path)

    # Build the full path to the target
    target_full = os.path.join(root_dir, target_path)

    # Calculate relative path
    try:
        rel_path = os.path.relpath(target_full, source_dir)
        return rel_path
    except ValueError:
        # If we can't calculate relative path, return the original
        return target_path

def fix_links_in_file(file_path, root_dir):
    """
    Fix GitHub URLs in a single HTML file.

    Args:
        file_path: Path to the HTML file
        root_dir: Root directory of the repository

    Returns:
        Tuple of (number of replacements, list of changes)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes = []

        # Find all instances of the GitHub base URL
        pattern = re.compile(re.escape(GITHUB_BASE_URL) + r'([^"\'\s<>]+)')
        matches = pattern.findall(content)

        if not matches:
            return 0, []

        # Replace each match with relative path
        for target_path in set(matches):  # Use set to avoid duplicates
            old_url = GITHUB_BASE_URL + target_path
            new_url = calculate_relative_path(file_path, target_path, root_dir)

            content = content.replace(old_url, new_url)
            changes.append((old_url, new_url))

        # Write back if changes were made
        if content != original_content:
            # Create backup
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            # Write updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

        return len(changes), changes

    except Exception as e:
        print(f"  ❌ Error processing file: {e}")
        return 0, []

def main():
    """Main function to process all HTML files."""
    print("=" * 70)
    print("HTML LINK FIXER - Converting GitHub URLs to Relative Links")
    print("=" * 70)
    print()

    # Get the script's directory (should be the repo root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Working directory: {script_dir}")
    print()

    # Find all HTML files
    print("Scanning for HTML files...")
    html_files = get_all_html_files(script_dir)
    total_files = len(html_files)
    print(f"Found {total_files} HTML files")
    print()

    # Process each file
    total_changes = 0
    files_modified = 0

    for idx, file_path in enumerate(html_files, 1):
        # Get relative path for display
        rel_path = os.path.relpath(file_path, script_dir)

        print(f"[{idx}/{total_files}] Processing: {rel_path}")

        num_changes, changes = fix_links_in_file(file_path, script_dir)

        if num_changes > 0:
            files_modified += 1
            total_changes += num_changes
            print(f"  ✓ Fixed {num_changes} link(s)")
            for old, new in changes:
                print(f"    • {old}")
                print(f"      → {new}")
        else:
            print(f"  • No GitHub URLs found")

        print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total files scanned:   {total_files}")
    print(f"Files modified:        {files_modified}")
    print(f"Total links fixed:     {total_changes}")
    print()

    if files_modified > 0:
        print("✓ All links have been converted to relative paths!")
        print("✓ Backups created with .backup extension")
        print()
        print("Next steps:")
        print("  1. Test the changes locally by opening HTML files in browser")
        print("  2. Commit changes to GitHub")
        print("  3. Redeploy to Hostinger VPS")
    else:
        print("No changes were needed.")

    print("=" * 70)

if __name__ == "__main__":
    main()
