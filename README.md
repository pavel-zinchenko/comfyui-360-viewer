# ComfyUI 360° Viewer

A custom node that displays equirectangular (360°) panoramic images as an interactive sphere directly inside the ComfyUI node.

![360 Viewer Node](screenshot.png)

## Features

- Interactive 360° view inside the node
- Drag to look around
- Scroll to zoom
- Resizes with the node

## Installation

### Manual

1. Clone or download this repo into your `ComfyUI/custom_nodes/` folder:
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/YOUR_USERNAME/comfyui-360-viewer
   ```
2. Restart ComfyUI

### ComfyUI-Manager

Search for **360 Viewer** in the Manager and install.

## Usage

1. Add the **360° Viewer** node (category: `image`)
2. Connect any IMAGE output to it
3. Queue — the node displays the image as an interactive 360° sphere

## Requirements

No additional Python packages required.
