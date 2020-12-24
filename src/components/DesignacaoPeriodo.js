class GrupoDesignacao {
  constructor(nomeGrupo, nomeSala, partes) {
    this.nomeSala = nomeSala;
    this.nomeGrupo = nomeGrupo;
    this.partes = [];
    partes.forEach((a) => {
      this.partes.push({
        titulo: a.replace(":", ""),
        vaga1: null,
        vaga2: null,
      });
    });
    //this.preencheVaga();
  }
}
export class DesignacaoPeriodo {
  constructor(irmaos, partes, gruposNumero) {
    this.irmaos = [...irmaos];
    this.partes = partes;
    this.grupos = [];
    this.gruposNumero = gruposNumero;
  }
  montar(){
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
            a.vaga1 = this.procuraIrmao("L", x.nomeGrupo, "M");
          }
          if (a.titulo.toLowerCase().match("discurso")) {
            a.vaga1 = this.procuraIrmao("D", x.nomeGrupo, "M");
          }
          if (a.titulo.toLowerCase().match("conversa")) {
            a.vaga1 = this.procuraIrmao("C", x.nomeGrupo);
            a.vaga2 = this.procuraIrmao(
              "A",
              x.nomeGrupo,
              a.vaga1.sexo,
              a.vaga1.privilegio
            );
          }
          if (a.titulo.toLowerCase().match("estudo")) {
            a.vaga1 = this.procuraIrmao("E", x.nomeGrupo);
            a.vaga2 = this.procuraIrmao(
              "A",
              x.nomeGrupo,
              a.vaga1.sexo,
              a.vaga1.privilegio
            );
          }
          if (a.titulo.toLowerCase().match("revisita")) {
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
}


