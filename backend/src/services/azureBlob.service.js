const { BlobServiceClient } = require("@azure/storage-blob");
const env = require("../config/env");

class AzureBlobService {
  constructor() {
    this.containerName = env.AZURE_STORAGE_CONTAINER_NAME || "certificate-templates";
  }

  getBlobServiceClient() {
    if (!env.AZURE_STORAGE_CONNECTION_STRING) {
      return null;
    }
    return BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
  }

  async uploadSVGTemplate(filename, svgContent) {
    const blobServiceClient = this.getBlobServiceClient();

    if (!blobServiceClient) {
      console.warn("AZURE_STORAGE_CONNECTION_STRING not set. Using local template URL fallback.");
      const safeName = (filename || "template").replace(/[^a-zA-Z0-9._-]/g, "_");
      return `https://mscprpcem.blob.core.windows.net/${this.containerName}/${safeName}`;
    }

    try {
      const containerClient = blobServiceClient.getContainerClient(this.containerName);
      await containerClient.createIfNotExists({ access: "blob" });

      const blobName = `${Date.now()}-${(filename || "template.svg").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const buffer = Buffer.from(svgContent, "utf-8");
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: "image/svg+xml" }
      });

      console.log(`SVG template uploaded successfully to Azure Blob Storage: ${blockBlobClient.url}`);
      return blockBlobClient.url;
    } catch (err) {
      console.error("Failed to upload SVG to Azure Blob Storage:", err.message);
      throw new Error(`Azure Blob Storage upload failed: ${err.message}`);
    }
  }

  async fetchSVGFromBlobUrl(blobUrl) {
    if (!blobUrl || !blobUrl.startsWith("http")) {
      return null;
    }

    try {
      const res = await fetch(blobUrl);
      if (res.ok) {
        return await res.text();
      }
      console.error(`Failed to fetch SVG from Blob URL ${blobUrl}: status ${res.status}`);
      return null;
    } catch (err) {
      console.error(`Error fetching SVG from Azure Blob URL (${blobUrl}):`, err.message);
      return null;
    }
  }
}

module.exports = new AzureBlobService();
