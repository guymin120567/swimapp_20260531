export async function compressImage(file){

  return new Promise(resolve=>{

    const reader =
      new FileReader();

    reader.onload = event=>{

      const img =
        new Image();

      img.onload = ()=>{

        const canvas =
          document.createElement(
            "canvas"
          );

        const ctx =
          canvas.getContext("2d");

        const MAX_SIZE = 800;

        let width =
          img.width;

        let height =
          img.height;

        if(width > height){

          if(width > MAX_SIZE){

            height *=
              MAX_SIZE / width;

            width =
              MAX_SIZE;
          }
        }
        else{

          if(height > MAX_SIZE){

            width *=
              MAX_SIZE / height;

            height =
              MAX_SIZE;
          }
        }

        canvas.width =
          width;

        canvas.height =
          height;

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressed =
          canvas.toDataURL(
            "image/webp",
            .72
          );

        resolve(
          compressed
        );
      };

      img.src =
        event.target.result;
    };

    reader.readAsDataURL(
      file
    );
  });
}
