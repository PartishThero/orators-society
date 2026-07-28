export async function fetchDriveFiles(folderId) {
  const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
  
  if (!apiKey) {
    console.error("VITE_GOOGLE_DRIVE_API_KEY is not defined");
    return [];
  }
  
  try {
    // Only fetch image and video files
    const query = `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${apiKey}&fields=files(id,mimeType,name,thumbnailLink,webContentLink)&pageSize=50`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Error fetching Google Drive files", await response.text());
      return [];
    }
    
    const data = await response.json();
    return data.files.map(file => ({
      ...file,
      url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
