export default ({
  serviceName,
  orgName,
  customerName,
  surveyLink,
}: {
  serviceName?: string;
  orgName?: string;
  customerName?: string;
  surveyLink: string;
}) => `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px; ">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div >
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px; ">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">Gracias por tu visita, ${customerName}</h2>
    <p style="margin-top:14px; color:#4B5563">Esperamos que hayas disfrutado tu experiencia en <strong>${orgName}</strong>.</p>
    <p style="margin-top:14px; color:#4B5563">Nos encantaría conocer tu opinión sobre tu cita de <strong>${serviceName}</strong>.</p>

    <div style="margin-top:40px; text-align:center;">
      <p style="color:#4B5563; margin-bottom:16px; font-size:16px; font-weight:bold;">¿Cómo calificarías tu experiencia?</p>

      <table style="margin: 0 auto; border-spacing: 8px;">
        <tr>
          <td>
            <a href="${surveyLink}&rating=1" style="text-decoration:none;">
              <div style="font-size:32px; padding:8px 12px; background:#FEE2E2; border-radius:12px; cursor:pointer;">
                😞
              </div>
            </a>
          </td>
          <td>
            <a href="${surveyLink}&rating=2" style="text-decoration:none;">
              <div style="font-size:32px; padding:8px 12px; background:#FEF3C7; border-radius:12px; cursor:pointer;">
                😕
              </div>
            </a>
          </td>
          <td>
            <a href="${surveyLink}&rating=3" style="text-decoration:none;">
              <div style="font-size:32px; padding:8px 12px; background:#FEF9C3; border-radius:12px; cursor:pointer;">
                😐
              </div>
            </a>
          </td>
          <td>
            <a href="${surveyLink}&rating=4" style="text-decoration:none;">
              <div style="font-size:32px; padding:8px 12px; background:#D1FAE5; border-radius:12px; cursor:pointer;">
                😊
              </div>
            </a>
          </td>
          <td>
            <a href="${surveyLink}&rating=5" style="text-decoration:none;">
              <div style="font-size:32px; padding:8px 12px; background:#DCFCE7; border-radius:12px; cursor:pointer;">
                😍
              </div>
            </a>
          </td>
        </tr>
        <tr>
          <td style="text-align:center; font-size:11px; color:#9CA3AF;">Malo</td>
          <td></td>
          <td style="text-align:center; font-size:11px; color:#9CA3AF;">Regular</td>
          <td></td>
          <td style="text-align:center; font-size:11px; color:#9CA3AF;">Excelente</td>
        </tr>
      </table>
    </div>

    <div style="margin-top:40px; text-align:center;">
      <a style="text-decoration:none;" href="${surveyLink}" target="blank">
        <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:200px; cursor:pointer; font-size:14px;">
          Dejar comentario
        </button>
      </a>
    </div>

  </div>
  <div>
    <p style="font-size:12px; color:#8391A1; margin-top:64px;">Tu opinión nos ayuda a mejorar. Gracias por tomarte el tiempo de compartir tu experiencia.</p>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">

   <a href="https://www.denik.me" target="blank" style="text-decoration:none">
     <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník© 2024</p>
    </a>


</div>
</body>
`;
