<script>
import Header from "./components/Header.svelte";
import Footer from "./components/Footer.svelte";
import Tabs from "./shared/Tabs.svelte";
import Button from "./shared/Button.svelte";
import Modal from "./shared/Modal.svelte";
import AddPersonForm from "./components/AddPersonForm.svelte";
import SortGroup from "./components/SortGroup.svelte";
import {
  fly
} from "svelte/transition";
import ListPerson from "./components/ListPerson.svelte";
import PopupConfirm from "./shared/PopupConfirm.svelte";
import Designation from "./components/Designation.svelte";
import {
  auth
} from "../firebase";
import {
  authState
} from "rxfire/auth";
import {
  db
} from "../firebase";
import {
  collectionData
} from "rxfire/firestore";
import LoginUser from "./components/LoginUser.svelte";
import {
  onDestroy
} from "svelte";
import NewPass from "./components/NewPass.svelte";
import SnackBar from "./shared/SnackBar.svelte";
import {
  startWith
} from 'rxjs/operators';
import { destroy_block } from "svelte/internal";

let user;
let newPass = false;
let items = ["Irmãos", "Grupos", "Designações"];
let activeItem = "Designações";
let showModal = false;
let formTitle = "Adicionar Irmão";
let irmao = {};
let iniciais = "";
let popupConfirm = false;
let message = "";
let textSnack = "Erro: Passou muito tempo logado!";
let showSnack = false;
let colorSnack = "green";
let irmaos = [];
let gruposNumero = [];
let idGrupos;
let authenticated = false;


const gruposRef = db.collection("gruposNumero");
const irmaosRef = db.collection("irmaos");
let unsubscribeGrupos;
let unsubscribeIrmaos;
let unsubscribeUser;

const subs = () => {
  unsubscribeUser = authState(auth).subscribe((u) => (user = u));
  unsubscribeGrupos = collectionData(gruposRef, "id").subscribe((a) => {
    if (a[0]) {
      const grupos = a[0].grupos;

      idGrupos = a[0].id;
      gruposNumero = [...grupos];
    }

  });

  unsubscribeIrmaos = collectionData(irmaosRef, "id").subscribe((a) => {
    console.log(a, "tabela irmaos");
    if (a) {
      console.log(a, "tabela irmaos");
      irmaos = [...a];
      console.log(irmaos);
    }
  });
}


const updateGrupos = () => {
  gruposRef.doc(idGrupos).update({
    grupos: gruposNumero
  });
}

let partesPrivilegios = [{
    privilegio: "E",
    sexo: "M",
    items: ["10I", "20L", "30L", "40A", "50C", "60A", "70R", "80A", "90E", "11A", "21D", ],
  },
  {
    privilegio: "E",
    sexo: "F",
    items: ["10I", "20A", "30A", "40C", "50A", "60R", "70A", "80R", "90A", "11E", "21A", ],
  },
  {
    privilegio: "P",
    sexo: "M",
    items: ["10I", "20L", "30L", "40C", "50A", "60R", "70A", "80E", "90A", "11L", "21D", ],
  },
  {
    privilegio: "P",
    sexo: "F",
    items: ["10I", "20C", "30A", "40R", "50A", "60E", "70A"],
  },
  {
    privilegio: "S",
    sexo: "M",
    items: []
  },
  {
    privilegio: "A",
    sexo: "M",
    items: []
  },
];

const tabChange = (e) => {
  activeItem = e.detail;
};

let toggleModal = (action, e) => {
  popupConfirm = false;
  newPass = false;

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
    console.log(irmao);
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

  if (action == "newPass") {
    formTitle = "Editar Senha";
    newPass = true;
  }

  showModal = !showModal;
};

const addPerson = (e) => {
  if (!e.detail.id) irmaosRef.add(e.detail);
  else irmaosRef.doc(e.detail.id).update(e.detail);
  showModal = !showModal;
};

const deletePerson = () => {
  irmaosRef.doc(irmao.id).delete();
  showModal = !showModal;
};

$: filteredIrmaos = iniciais ?
  irmaos.filter((irmao) => {
    const nome = `${irmao.nome}`;
    return nome.toLowerCase().startsWith(iniciais.toLowerCase());
  }) :
  [...irmaos];

const handleUpdatePass = (e) => {
  auth.currentUser
    .updatePassword(e.detail.senha)
    .then((_) => {
      snackData("green", "Senha modificada!");
      showModal = !showModal;
      newPass = false;
    })
    .catch((error) => {
      console.log(error);
      if (error.code === "auth/requires-recent-login") {
        snackData("red", "Erro: Saia e logue novamente!");
      }
      showModal = !showModal;
      newPass = false;
    });
};

const snackData = (color, snText) => {
  textSnack = snText;
  colorSnack = color;
  showSnack = true;
  setTimeout((_) => (showSnack = false), 6000);
};

onDestroy(() => { 
  unsubscribeUser.unsubscribe(); 
  unsubscribeIrmaos.unsubscribe();
  unsubscribeGrupos.unsubscribe();
  user = null; 
});

const destroy_custom = () =>{
  unsubscribeUser.unsubscribe(); 
  unsubscribeIrmaos.unsubscribe();
  unsubscribeGrupos.unsubscribe();
  user = null; 
}

</script>

<style>
main {
  max-width: 960px;
  margin: 5px auto;
}

.operation-buttons {
  display: flex;
  justify-content: space-between;
}
</style>

<SnackBar color={colorSnack} {showSnack} text={textSnack} />

<Modal {showModal} on:click={toggleModal}>
    {#if popupConfirm}
    <PopupConfirm
        {message}
        on:action={(e) => {
        e.detail ? deletePerson() : (showModal = !showModal);
        }} />
    {:else if newPass}
    <NewPass
        on:newPass={(e) => {
        handleUpdatePass(e);
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
    <section class="operation-buttons">
        <Button type="neutral" on:click={() => { auth.signOut(); destroy_custom();}}>Sair</Button>
        <Button type="neutral" on:click={() => toggleModal('newPass')}>
            Nova senha
        </Button>
    </section>
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
<LoginUser
    on:logUser={(e) =>  { auth.signInWithEmailAndPassword(e.detail.user, e.detail.senha).then(_ =>{
    subs();
    })

    }
    }
    on:resetPass={(e) => auth.sendPasswordResetEmail(e.detail.user)} />
{/if}
