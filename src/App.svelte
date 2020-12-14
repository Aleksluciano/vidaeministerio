<script>
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import Tabs from "./shared/Tabs.svelte";
  import Button from "./shared/Button.svelte";
  import Modal from "./shared/Modal.svelte";
  import AddPersonForm from "./components/AddPersonForm.svelte";
  import SortGroup from "./components/SortGroup.svelte";

  import { fly } from "svelte/transition";
  import ListPerson from "./components/ListPerson.svelte";
  import { fakeIrmaos } from "./shared/fakedata/fakedata";
  import PopupConfirm from "./shared/PopupConfirm.svelte";
  import Designation from "./components/Designation.svelte";

  import { auth, googleProvider } from "../firebase";
  import { authState } from "rxfire/auth";

  import { db } from "../firebase";
  import { collectionData } from "rxfire/firestore";
import Calender from "./shared/date/Calender.svelte";
import Login from './components/Login.svelte';

  let user;

  const unsubscribe = authState(auth).subscribe((u) => (user = u));

  // function login() {
  //   auth.signInWithPopup(googleProvider);
  // }

  let irmaos = [];
  //const todosGrupos = [...fakeGrupos];
  let gruposNumero = [];
  const gruposRef = db.collection("gruposNumero");
  const irmaosRef = db.collection("irmaos");
  let idGrupos;

  collectionData(gruposRef, "id").subscribe((a) => {
    if (a) {
      idGrupos = a[0].id;
      gruposNumero = [...a[0].grupos];
    }
  });

  collectionData(irmaosRef, "id").subscribe((a) => {
    if (a) {
      console.log(a,"tabela irmaos")
      irmaos = [...a];
      console.log(irmaos)
    }
  });
  function updateGrupos() {
    gruposRef.doc(idGrupos).update({ grupos: gruposNumero });
  }

  let partesPrivilegios = [
    {
      privilegio: "E",
      sexo: "M",
      items: [
        "10I",
        "20L",
        "30L",
        "40A",
        "50C",
        "60A",
        "70R",
        "80A",
        "90E",
        "11A",
        "21D",
      ],
    },
    {
      privilegio: "E",
      sexo: "F",
      items: [
        "10I",
        "20A",
        "30A",
        "40C",
        "50A",
        "60R",
        "70A",
        "80R",
        "90A",
        "11E",
        "21A",
      ],
    },
    {
      privilegio: "P",
      sexo: "M",
      items: [
        "10I",
        "20L",
        "30L",
        "40C",
        "50A",
        "60R",
        "70A",
        "80E",
        "90A",
        "11L",
        "21D",
      ],
    },
    {
      privilegio: "P",
      sexo: "F",
      items: ["10I", "20C", "30A", "40R", "50A", "60E", "70A"],
    },
    { privilegio: "S", sexo: "M", items: [] },
    { privilegio: "A", sexo: "M", items: [] },
  ];

  let items = ["Irmãos", "Grupos", "Designações"]; //avaible tabs
  //let activeItem = "Irmãos"; // active tab
  let activeItem = "Designações";
  // let animeOptions = {
  //   duration: 0
  // }; //time to animation fade in and fade out in table
  let showModal = false; //show or hide modal
  let formTitle = "Adicionar Irmão"; //tile of the form
  let irmao = {};
  let iniciais = "";
  let popupConfirm = false;
  let message = "";

  //change active tab
  const tabChange = (e) => {
    activeItem = e.detail;
  };

  let toggleModal = (action, e) => {
    popupConfirm = false;

    if (action == "add") {
      formTitle = "Adicionar Irmão";
      irmao = {
        situacao: true,
      };
    }

    if (action == "edit") {
      irmao = {
        ...e.detail,
      };
      console.log(irmao)
      formTitle = "Editar Irmão";
    }

    if (action == "confirm") {
      irmao = {
        ...e.detail,
      };
      formTitle = "Confirmação";
      message = `Tem certeza que quer excluir ${irmao.nome} ?`;
      popupConfirm = true;
    }

    showModal = !showModal;
  };

  const addPerson = (e) => {
    if(!e.detail.id)irmaosRef.add(e.detail)
    else irmaosRef.doc(e.detail.id).update(e.detail);
    showModal = !showModal;
  };

  const deletePerson = () => {
    irmaosRef.doc(irmao.id).delete();
    showModal = !showModal;
  };

  $: filteredIrmaos = iniciais
    ? irmaos.filter((irmao) => {
        const nome = `${irmao.nome}`;
        return nome.toLowerCase().startsWith(iniciais.toLowerCase());
      })
    : [...irmaos];
</script>

<style>
  main {
    max-width: 960px;
    margin: 5px auto;
  }


</style>

<Modal {showModal} on:click={toggleModal}>
  {#if popupConfirm}
    <PopupConfirm
      {message}
      on:action={(e) => {
        e.detail ? deletePerson() : (showModal = !showModal);
      }} />
  {:else}
    <AddPersonForm {partesPrivilegios} {irmao} on:addPerson={addPerson} />
  {/if}
  <div slot="title">
    <h3>{formTitle}</h3>
  </div>
</Modal>

<Header />
{#if user}
 
  <main>
    <button class="sair-button" on:click={() => auth.signOut()}>Sair</button>
    <Tabs {activeItem} {items} on:tabChange={tabChange} />

    {#if activeItem == 'Irmãos'}
      <div in:fly={{ y: 300, duration: 1000 }}>
        <Button
          type="secondary"
          inverse={true}
          on:click={() => {
            toggleModal('add');
          }}>
          + Irmão
        </Button>
        <input placeholder="filtra nome" bind:value={iniciais} />
        <ListPerson
          {partesPrivilegios}
          irmaos={filteredIrmaos}
          on:editPerson={(e) => {
            toggleModal('edit', e);
          }}
          on:deletePerson={(e) => {
            toggleModal('confirm', e);
          }} />
      </div>
    {:else if activeItem == 'Grupos'}
      <div in:fly={{ y: 300, duration: 1000 }}>
        <SortGroup {gruposNumero} on:updateGrupos={updateGrupos} />
      </div>
    {:else if activeItem == 'Designações'}
      <div in:fly={{ y: 300, duration: 1000 }}>
        <Designation {irmaos} {gruposNumero} />
      </div>
    {/if}
  </main>
  <Footer />
{:else}
<!-- <button on:click={login}> Entrar </button> -->
<Login on:logUser={(e) => { console.log(e,"jdhsja"); auth.signInWithEmailAndPassword(e.detail.user, e.detail.senha); } }/>
{/if}
<!-- 1234 -->
