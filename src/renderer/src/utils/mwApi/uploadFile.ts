interface UploadResponse {
  edit: {
    result: string;
    pageid: number;
    title: string;
    contentmodel: string;
    oldrevid: number;
    newrevid: number;
    newtimestamp: string;
  };
}

async function uploadFile(file: File, text?: string): Promise<boolean> {
  return new Promise((resolve) => {
    new mw.Api()
      .postWithToken(
        "csrf",
        {
          action: "upload",
          file: file,
          filename: file.name,
          ignorewarnings: true,
          text: text,
        },
        {
          contentType: "multipart/form-data",
        },
      )
      .done((data) => {
        window.$message.success("上传成功");
        console.log(data as UploadResponse);
        resolve(true);
      })
      .fail((data: string) => {
        window.$message.error(`上传失败（${data}）`);
        console.log(data);
        resolve(false);
      });
  });
}

export default uploadFile;
