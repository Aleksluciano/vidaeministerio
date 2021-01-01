import { nDate } from "../shared/date/nDate";

class GrupoDesignacao {
  constructor(nomeGrupo, nomeSala, partes) {
    this.nomeSala = nomeSala;
    this.nomeGrupo = nomeGrupo;
    this.partes = [];
    partes.forEach((a) => {
      this.partes.push({
        siglaParte: "",
        titulo: a.replace(":", ""),
        vaga1: null,
        vaga2: null,
      });
    });
    //this.preencheVaga();
  }
}
export class DesignacaoPeriodo {
  constructor(irmaos, infJw, gruposNumero, dataInicial) {
    this.irmaos = irmaos;
    this.infJw = infJw;
    this.imagem = infJw.imagemjw;
    this.linksite = infJw.linksitejw;
    this.partes = infJw.partesjw;
    this.grupos = [];
    this.reverseIrmaos = [];
    this.irmaosUp = [];
    this.gruposNumero = gruposNumero;
    this.dataInicial = dataInicial;
  }
  montar() {
    this.geraSalasParaGrupos();
    this.designaPartes();
  }
  geraSalasParaGrupos() {
    this.gruposNumero.forEach((a) => {
      if (a.items?.length > 0) {
        this.adicionaNovoGrupo(
          new GrupoDesignacao(a.name, "Principal", [...this.partes])
        );
        if (a.salaB)
          this.adicionaNovoGrupo(
            new GrupoDesignacao(a.name, "Sala B", [...this.partes])
          );
        if (a.salaC)
          this.adicionaNovoGrupo(
            new GrupoDesignacao(a.name, "Sala C", [...this.partes])
          );
      }
    });
  }
  adicionaNovoGrupo(grupoDesignacao) {
    this.grupos.push({ ...grupoDesignacao });
  }
  designaPartes() {
    this.grupos.forEach((x) => {
      x.partes.forEach((a) => {
        if (!a.titulo.toLowerCase().match("vídeo")) {
          if (a.titulo.toLowerCase().match("leitura")) {
            a.siglaParte = "L";
            a.vaga1 = this.procuraIrmao("L", x.nomeGrupo, "M");
          }
          if (a.titulo.toLowerCase().match("discurso")) {
            a.siglaParte = "D";
            a.vaga1 = this.procuraIrmao("D", x.nomeGrupo, "M");
          }
          if (a.titulo.toLowerCase().match("conversa")) {
            a.siglaParte = "C";
            a.vaga1 = this.procuraIrmao("C", x.nomeGrupo);
            a.vaga2 = this.procuraIrmao(
              "A",
              x.nomeGrupo,
              a.vaga1.sexo,
              a.vaga1.privilegio
            );
          }
          if (a.titulo.toLowerCase().match("estudo")) {
            a.siglaParte = "E";
            a.vaga1 = this.procuraIrmao("E", x.nomeGrupo);
            a.vaga2 = this.procuraIrmao(
              "A",
              x.nomeGrupo,
              a.vaga1.sexo,
              a.vaga1.privilegio
            );
          }
          if (a.titulo.toLowerCase().match("revisita")) {
            a.siglaParte = "R";
            a.vaga1 = this.procuraIrmao("R", x.nomeGrupo);
            a.vaga2 = this.procuraIrmao(
              "A",
              x.nomeGrupo,
              a.vaga1.sexo,
              a.vaga1.privilegio
            );
          }
        }
      });
    });
  }
  procuraIrmao(parte, nomeGrupo, sexo, privilegio) {
    let pessoas;
    let pessoa;

    if (this.notEmpty(this.irmaos))
      pessoas = this.filtraAtivadasParaEscalar(this.irmaos);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraNaoDesignadasParaOutrasSalas(pessoas);
    // if (this.notEmpty(pessoas))
    //   pessoas = this.filtraNaoDesignadasParaEstaSala(pessoas,x);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraDoMesmoGrupo(pessoas, nomeGrupo);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraComProximaParteRelacionada(pessoas, parte);
    if (this.notEmpty(pessoas) && sexo)
      pessoas = this.filtraDoMesmoSexo(pessoas, sexo);
    if (this.notEmpty(pessoas) && privilegio == "E")
      pessoas = this.filtraApenasPublicadores(pessoas);
    if (this.notEmpty(pessoas))
      pessoa = this.filtraPrimeiraPessoaAdequada(pessoas);
    if (!pessoa) pessoa = { nome: "⚡" };
    return { ...pessoa };
  }

  filtraAtivadasParaEscalar() {
    return this.irmaos.filter((a) => a.situacao);
  }

  filtraNaoDesignadasParaOutrasSalas(pessoas) {
    return pessoas.filter(
      (a) =>
        !this.grupos.some((b) =>
          b.partes.some((c) => c.vaga1?.id == a.id || c.vaga2?.id == a.id)
        )
    );
  }
  filtraNaoDesignadasParaEstaSala(pessoas, x) {
    return pessoas.filter(
      (a) => !x.partes.some((c) => c.vaga1?.id == a.id || c.vaga2?.id == a.id)
    );
  }
  filtraDoMesmoGrupo(pessoas, nomeGrupo) {
    return pessoas.filter((a) =>
      this.gruposNumero
        .find((x) => x.name == nomeGrupo)
        ?.items.includes(a.grupo)
    );
  }
  filtraComProximaParteRelacionada(pessoas, parte) {
    return pessoas.filter((a) => a.proximaParte.substring(2) == parte);
  }
  filtraDoMesmoSexo(pessoas, sexo) {
    return pessoas.filter((a) => a.sexo == sexo);
  }
  filtraApenasPublicadores(pessoas) {
    return pessoas.filter((a) => a.privilegio == "P");
  }
  filtraPrimeiraPessoaAdequada(pessoas) {
    return pessoas.splice(0, 1)[0];
  }
  notEmpty(array) {
    return array.length > 0;
  }

  diasSemParte(data) {
    let hoje = this.dataInicial;

    let Difference_In_Time = hoje.getTime() - nDate(data).getTime();
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    let result = Difference_In_Days.toFixed(0);
    if (result < 0) result = result * -1;
    return result;
  }

  substituicao(data) {
    let pessoas = [...this.irmaos];
   
    if (this.notEmpty(pessoas))
      pessoas = this.filtraAtivadasParaEscalar(this.pessoas);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraNaoDesignadasParaOutrasSalas(pessoas);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraDoMesmoGrupo(pessoas, data.nomeGrupo);

    if (this.notEmpty(pessoas)) {
      let sexo = null;
      if (data.siglaParte == "L" || data.siglaParte == "D") {
        sexo = "M";
      } else {
        //if (data.irmao.nome !== "⚡") sexo = data.irmao.sexo;
        if (data.irmao2.nome !== "⚡")sexo = data.irmao2.sexo;
       //   if(data.irmao2.nome == "⚡")
      }
      if (sexo) pessoas = this.filtraDoMesmoSexo(pessoas, sexo);
    }
    if (this.notEmpty(pessoas))
      pessoas = this.filtraComProximaParteRelacionada(pessoas, data.siglaParte);

    if (pessoas.length >= 0) pessoas.unshift({ nome: "⚡" });

    return pessoas;
  }

  troca(newirmao, data) {
    let achou = false;
    this.grupos.forEach((x) => {
      x.partes.forEach((a) => {
        if (
          x.nomeGrupo == data.nomeGrupo &&
          x.nomeSala == data.nomeSala &&
          a.titulo == data.titulo
        ) {
          if (data.position == 1) {
            if(a.vaga1.id && !this.reverseIrmaos.find(z => z.id == a.vaga1.id))this.reverseIrmaos.push({...a.vaga1})
            a.vaga1 = { ...newirmao };
            achou = true;
          }
          if (data.position == 2) {
            if(a.vaga2.id && !this.reverseIrmaos.find(z => z.id == a.vaga2.id))this.reverseIrmaos.push({...a.vaga2})
            a.vaga2 = { ...newirmao };
            achou = true;
          }
        }
      });
    });
    return achou;
  }

  irmaosForUpdate() {
    let irmaosUp = [];
    this.grupos.forEach((x) => {
      x.partes.forEach((a) => {
     
        if (a.vaga1 && a.vaga1.nome != "⚡"){ irmaosUp.push({...a.vaga1});}
        if (a.vaga2 && a.vaga2.nome != "⚡"){ irmaosUp.push({...a.vaga2});}
      });
    });
    this.irmaosUp = [...irmaosUp];
    return irmaosUp;
  }

  setGrupos(grupos) {
    this.grupos = grupos;
  }
  setDataInicial(dataInicial) {
    this.dataInicial = dataInicial;
  }
}
