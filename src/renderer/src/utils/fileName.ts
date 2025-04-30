import base62 from "./base62";

function getBase62Name(originalName: string): string {
  const fileExt = originalName.split(".").pop();
  if (!fileExt) throw new Error("File name must have an extension");
  const fileNameWithoutExt = originalName.slice(
    0,
    originalName.length - fileExt.length - 1,
  );
  return `${base62.encode(fileNameWithoutExt)}.${fileExt}`;
}

function getOriginalName(Base62Name: string): string {
  const fileExt = Base62Name.split(".").pop();
  if (!fileExt) throw new Error("File name must have an extension");
  const fileNameWithoutExtBase62 = Base62Name.slice(
    0,
    Base62Name.length - fileExt.length - 1,
  );
  return `${base62.decode(fileNameWithoutExtBase62)}.${fileExt}`;
}

function isValidFilenameLength(filename: string): boolean {
  const fileNameBase62 = getBase62Name(filename);
  console.log(
    `file name length: ${filename.length}, base62 length: ${fileNameBase62.length}`,
  );
  return fileNameBase62.length <= 255;
}

function getFileExtname(filename: string): string {
  const fileExt = filename.split(".").pop();
  if (!fileExt) return "";
  return fileExt;
}

function getFileBasename(filename: string): string {
  const fileExt = getFileExtname(filename);
  return filename.slice(0, filename.length - fileExt.length - 1);
}

export {
  getBase62Name,
  getOriginalName,
  isValidFilenameLength,
  getFileExtname,
  getFileBasename,
};
