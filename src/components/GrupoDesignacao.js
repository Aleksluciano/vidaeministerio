export class GrupoDesignacao {
  constructor(grupo, partes, irmaos, grupoDesignacoes) {
    this.grupoDesignacoes = grupoDesignacoes
    this.irmaos = irmaos
    this.grupo = grupo
    this.partes = [];
    partes.forEach((a) => {
      this.partes.push({ titulo: a.replace(':',''), vaga1: null, vaga2: null });
    });
    this.preencheVaga();
  }

  preencheVaga() {
    this.partes.forEach((a) => {
      if (!a.titulo.toLowerCase().match("vídeo")) {
        if (a.titulo.toLowerCase().match("leitura")) {
          a.vaga1 = this.procuraIrmao("L", "M");
        }
        if (a.titulo.toLowerCase().match("discurso")) {
          a.vaga1 = this.procuraIrmao("D", "M");
        }
        if (a.titulo.toLowerCase().match("conversa")) {
          a.vaga1 = this.procuraIrmao("C");
          a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
        }
        if (a.titulo.toLowerCase().match("estudo")) {
          a.vaga1 = this.procuraIrmao("E");
          a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
        }
        if (a.titulo.toLowerCase().match("revisita")) {
          a.vaga1 = this.procuraIrmao("R");
          a.vaga2 = this.procuraIrmao("A", a.vaga1.sexo);
        }
      }
    });
  }

  procuraIrmao(parte, sexo) {
    let pessoas;
    let pessoa;

    if (this.notEmpty(this.irmaos))
      pessoas = this.filtraAtivadasParaEscalar(this.irmaos);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraNaoDesignadasParaOutrasSalas(pessoas);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraNaoDesignadasParaEstaSala(pessoas);
    if (this.notEmpty(pessoas)) pessoas = this.filtraDoMesmoGrupo(pessoas);
    if (this.notEmpty(pessoas))
      pessoas = this.filtraComProximaParteRelacionada(pessoas, parte);
    if (this.notEmpty(pessoas) && sexo)
      pessoas = this.filtraDoMesmoSexo(pessoas, sexo);
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
        !this.grupoDesignacoes.some((b) =>
          b.partes.some((c) => c.vaga1?.id == a.id || c.vaga2?.id == a.id)
        )
    );
  }
  filtraNaoDesignadasParaEstaSala(pessoas) {
    return pessoas.filter(
      (a) =>
        !this.partes.some((c) => c.vaga1?.id == a.id || c.vaga2?.id == a.id)
    );
  }
  filtraDoMesmoGrupo(pessoas) {
    return pessoas.filter((a) => this.grupo.items.includes(a.grupo));
  }
  filtraComProximaParteRelacionada(pessoas, parte) {
    return pessoas.filter((a) => a.proximaParte.substring(2) == parte);
  }
  filtraDoMesmoSexo(pessoas, sexo) {
    return pessoas.filter((a) => a.sexo == sexo);
  }
  filtraPrimeiraPessoaAdequada(pessoas) {
    return pessoas.splice(0, 1)[0];
  }
  notEmpty(array) {
    return array.length > 0;
  }
}