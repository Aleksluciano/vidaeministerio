import { PDFDocument, font } from "pdf-lib";

export class Arquivos {
  constructor(grupos,dataini,datafim) {
    this.oReq = new XMLHttpRequest();
    this.dataini = dataini.toLocaleDateString('pt-BR').substring(0,5)
    this.datafim = datafim.toLocaleDateString('pt-BR').substring(0,5)
    this.oReq.responseType = "blob";
    this.grupos = grupos;
    this.oReq.onload = this.load;
   
    this.pdfBytes;
   this.send();
  }
  send() {
    this.oReq.open("GET", "/files/model.pdf", true);
    this.oReq.send();
  }
  async montar(parte, nome,sala, nomeArquivo, ajudante) {
    try {
      const existingPdfBytes = await this.oReq.response.arrayBuffer();
      const buffer = new Uint8Array(existingPdfBytes);
      const pdfDoc = await PDFDocument.load(buffer);

      const form = pdfDoc.getForm();
      //const fields = form.getFields();

    
      let field = form.getField("Nome");
      field.setText(nome);
      field = form.getField("Data");
      field.setText(`${this.dataini} - ${this.datafim}`);
      if(ajudante){
      field = form.getField("Ajudante");
      field.setText(ajudante);
      }

      let check = form.getCheckBox(parte);
      check.check();
      check = form.getCheckBox(sala);
      check.check();

      this.pdfBytes = await await pdfDoc.save();

      var a = document.createElement("a");
      a.download = `${nomeArquivo}-${this.dataini}-${nome}.pdf`;
      a.style = "display:none";
      a.href = window.URL.createObjectURL(new Blob([this.getPdf()]));
      a.click();
      a.remove();

    } catch (e) {
      console.log(e);
    }
  }
  load = async () => {
     this.grupos.forEach((x) => {
      let sala = x.nomeSala;
      let nomeArquivo;
   
      if(x.nomeGrupo == 'Grupo 1')nomeArquivo = 'G1-P';
      if(x.nomeGrupo == 'Grupo 2')nomeArquivo = 'G2-P';
      if(x.nomeGrupo == 'Grupo 2')nomeArquivo = 'G3-P';
      if(sala == 'Sala B'){
        sala = 'SalaB';
        nomeArquivo = nomeArquivo.substr(0,3) + 'B'
      }
      if(sala == 'Sala C'){
        sala = 'SalaC';
        nomeArquivo = nomeArquivo.substr(0,3) + 'C'
      }
      x.partes.forEach((a) => {
       if (a.siglaParte == 'L' && a.vaga1.nome != "⚡"){
        nomeArquivo = nomeArquivo.substr(0,4) + 'L'
          this.montar('Leitura', a.vaga1.nome,sala,nomeArquivo);
          
        }
        if (a.siglaParte == 'D' && a.vaga1.nome != "⚡"){
          nomeArquivo = nomeArquivo.substr(0,4) + 'D'
          this.montar('Discurso', a.vaga1.nome,sala,nomeArquivo);
        }
        if (a.siglaParte == 'R' && ( a.vaga1.nome != "⚡" && a.vaga2.nome != "⚡")){
          nomeArquivo = nomeArquivo.substr(0,4) + 'R'
          this.montar('Revisita', a.vaga1.nome,sala, nomeArquivo,a.vaga2.nome);
        }
        if (a.siglaParte == 'E' && ( a.vaga1.nome != "⚡" && a.vaga2.nome != "⚡")){
          nomeArquivo = nomeArquivo.substr(0,4) + 'E'
          this.montar('Estudo', a.vaga1.nome,sala, nomeArquivo,a.vaga2.nome);
        }
        if (a.siglaParte == 'C' && ( a.vaga1.nome != "⚡" && a.vaga2.nome != "⚡")){
          nomeArquivo = nomeArquivo.substr(0,4) + 'C'
          this.montar('Conversa', a.vaga1.nome,sala,nomeArquivo, a.vaga2.nome);
        }
        
      });
     });
   
  
  }
  getPdf() {
    return this.pdfBytes;
  }
}
