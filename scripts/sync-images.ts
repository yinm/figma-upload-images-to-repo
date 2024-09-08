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

async function main() {
  const { FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY } = process.env;
  if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
    throw new Error("Please provide FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY");
  }

  const file = await fetchFile(FIGMA_FILE_KEY, FIGMA_ACCESS_TOKEN);
}
main();
