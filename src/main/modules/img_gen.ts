import { promises as fs } from "fs";
import path from "path";
import { app } from "electron";

interface InlineData {
  data: string;
  mime_type: string;
}

interface ContentPart {
  inline_data?: InlineData;
  text?: string;
}

interface Content {
  parts: ContentPart[];
}

interface Candidate {
  content?: Content;
}

interface StreamChunk {
  candidates?: Candidate[];
  text?: string;
}

async function saveBinaryFile(fileName: string, data: Buffer): Promise<void> {
  try {
    await fs.writeFile(fileName, data);
    console.log(`File saved to: ${fileName}`);
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
}

async function generatePixelAnimalImage(
  inputImagePath: string,
  outputDir?: string
): Promise<string[]> {
  try {
    const API_KEY = "AIzaSyD2uFiaPEyes1x3mY1OJWgSqoqYrkNtwWY";

    // Default output directory to img folder in user data
    const defaultOutputDir = path.join(app.getPath("userData"), "img");
    const finalOutputDir = outputDir || defaultOutputDir;

    // Ensure output directory exists
    await fs.mkdir(finalOutputDir, { recursive: true });

    // Resolve input image path (could be relative to app resources)
    let resolvedInputPath = inputImagePath;
    if (!path.isAbsolute(inputImagePath)) {
      resolvedInputPath = path.join(__dirname, inputImagePath);
    }

    // Check if input file exists
    try {
      await fs.access(resolvedInputPath);
    } catch {
      throw new Error(`Input image not found: ${resolvedInputPath}`);
    }

    // Read the input image
    const imageData = await fs.readFile(resolvedInputPath);

    // Prepare the request payload
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: "image/png", // Adjust if your image is different format
                data: imageData.toString("base64"),
              },
            },
            {
              text: "Create a pixel art image in the exact same style as this image, but make it a random animal. I want the animal to do the same as the one in the photo but I want him to hold a ticket.",
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "text/plain",
        responseModalities: ["IMAGE", "TEXT"],
      },
    };

    // Make the API request (using non-streaming endpoint for simplicity)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    const savedFiles: string[] = [];
    let fileIndex = 0;

    // Process the response
    if (responseData.candidates && responseData.candidates[0]?.content?.parts) {
      const parts = responseData.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inline_data?.data) {
          const fileName = `pixel_animal_generated_${Date.now()}_${fileIndex}`;
          fileIndex++;

          const dataBuffer = Buffer.from(part.inline_data.data, "base64");
          const fileExtension =
            part.inline_data.mime_type === "image/jpeg" ? "jpg" : "png";
          const fullPath = path.join(
            finalOutputDir,
            `${fileName}.${fileExtension}`
          );

          await saveBinaryFile(fullPath, dataBuffer);
          savedFiles.push(fullPath);
        } else if (part.text) {
          console.log("Generated text:", part.text);
        }
      }
    }

    return savedFiles;
  } catch (error) {
    console.error("Error generating pixel animal image:", error);
    throw error;
  }
}

// Export the function for use in your Electron main process
export { generatePixelAnimalImage };
