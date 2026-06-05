import os
import uuid
import numpy as np
from PIL import Image
import folder_paths

class View360Node:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "view360"
    OUTPUT_NODE = True
    CATEGORY = "image"

    def view360(self, image):
        # image is a torch tensor [B, H, W, C] float32 0-1
        i = 255.0 * image[0].cpu().numpy()
        img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))

        # Save to ComfyUI temp dir
        filename = f"360view_{uuid.uuid4().hex[:8]}.png"
        temp_dir = folder_paths.get_temp_directory()
        os.makedirs(temp_dir, exist_ok=True)
        filepath = os.path.join(temp_dir, filename)
        img.save(filepath)

        return {
            "ui": {
                "images": [{"filename": filename, "subfolder": "", "type": "temp"}]
            }
        }


NODE_CLASS_MAPPINGS = {"View360": View360Node}
NODE_DISPLAY_NAME_MAPPINGS = {"View360": "360° Viewer"}

WEB_DIRECTORY = "./web"
