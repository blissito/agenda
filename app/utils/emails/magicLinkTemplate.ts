export default ({ link }: { link: string }) => `
<body style="font-family:Arial;background-color:#F8F8F8; padding:24px ">
    <div style="min-width:360px; max-width:480px;  margin:0 auto;padding:24px;background-color:#ffffff; border-radius:24px;">
      <div>
        <img alt="logo" style="width:120px; margin-bottom:32px;" src="https://i.imgur.com/sunNMiV.png"/>
      </div>
      <div >
        <img style="width:100%" src="https://i.imgur.com/u30rscF.png "/>
      </div>
      <div style="text-align:left; margin-top:40px; ">
        <h2 style="color:#15191E; font-size:20px; margin-top:24px">
        ¡Hey! Aquí está tu enlace mágico 🪄 
        </h2>

        <a style="text-decoration:none;" href="${link}" target="blank">
            <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:160px; margin-top:40px; cursor:pointer;">
          Iniciar sesión
            </button>
        </a>
     
      </div>
       <div style="text-align:center; margin-top:64px; margin-bottom:16px">
           <p style="color:#4B5563;">
          Deník. Tu agenda. Tus clientes. Tu negocio.
        </p>
        <a href="https://www.facebook.com/profile.php?id=61554028371141" target="blank" style="text-decoration:none; "> 
          <img alt="facebook" style="width:28px; height:28px" src="https://i.imgur.com/JvkVAdP.png"/>
        </a>
           <a href="https://www.linkedin.com/company/99530596" target="blank" style="text-decoration:none;"> 
           <img alt="linkedin" style="width:28px; height:28px" src="https://i.imgur.com/Y8zd5tO.png"/>
        </a>
        <a href="https://twitter.com/FormmyApp1" target="blank" style="text-decoration:none;"> 
           <img alt="twitter"  style="width:28px; height:28px" src="https://i.imgur.com/kGOfcQP.png"/>
        </a>
        </a>
            <a href="https://www.youtube.com/@_FormmyApp" target="blank" style="text-decoration:none;"> 
           <img alt="instagram"  style="width:28px; height:28px" src="https://i.imgur.com/cqGKCq6.png"/>
        </a>
       <a href="https://www.youtube.com/@_FormmyApp" target="blank" style="text-decoration:none;"> 
           <img alt="youtube"  style="width:28px; height:28px" src="https://i.imgur.com/S92vVcz.png"/>
      </a>
      </div>
        <div style="text-align:center; margin-top:32px; margin-bottom:16px">
        <a href="https://www.denik.me" target="blank" style="text-decoration:none;"> 
            <p style="color:#4B5563;font-size:10px;cursor:pointer;">Derechos reservados Deník© 2024</p>
        </a>
        </div>

    </div>
</body>
`
