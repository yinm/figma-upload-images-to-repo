const baseUrl = "https://api.figma.com/v1";

/**
 * https://www.figma.com/developers/api#component-type
 * Only `components` is required for our use case
 */
interface FigmaFile {
  components: Record<string, { name: string }>;
}
/**
 * https://www.figma.com/developers/api#get-files-endpoint
 */
async function fetchFile(
  fileKey: string,
  accessToken: string
): Promise<FigmaFile> {
  const response = await fetch(`${baseUrl}/files/${fileKey}`, {
    headers: {
      "X-Figma-Token": accessToken,
    },
  });

  return response.json();
}

interface FigmaImages {
  err: string;
  images: Record<string, string>;
}
/**
 * https://www.figma.com/developers/api#get-images-endpoint
 */
async function fetchImageUrls(
  /** Only "svg" and "png" are required for our use case */
  format: "svg" | "png",
  nodeIds: string[],
  fileKey: string,
  accessToken: string
): Promise<FigmaImages> {
  const response = await fetch(
    `${baseUrl}/images/${fileKey}?format=${format}&ids=${nodeIds.join(",")}`,
    {
      headers: {
        "X-Figma-Token": accessToken,
      },
    }
  );

  return response.json();
}

function buildImages(
  nodeIds: string[],
  file: FigmaFile,
  imageUrls: FigmaImages
) {
  return nodeIds.map((id) => {
    // Require to change name for writing file
    // - Remove `/` (because it's interpreted as directory)
    // - Remove leading and trailing white spaces
    const fileWritableName = file.components[id].name.split("/").at(-1)?.trim();
    if (fileWritableName === undefined) {
      throw new Error(
        `Found unhandled component: "${id}: ${file.components[id].name}"`
      );
    }

    return {
      name: fileWritableName,
      url: imageUrls.images[id],
    };
  });
}

async function main() {
  const { FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY } = process.env;
  if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
    throw new Error("Please provide FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY");
  }

  const file = await fetchFile(FIGMA_FILE_KEY, FIGMA_ACCESS_TOKEN);
  const nodeIds = Object.keys(file.components);

  const imageUrls = await fetchImageUrls(
    "png",
    nodeIds,
    FIGMA_FILE_KEY,
    FIGMA_ACCESS_TOKEN
  );

  const images = buildImages(nodeIds, file, imageUrls);
}
main();
