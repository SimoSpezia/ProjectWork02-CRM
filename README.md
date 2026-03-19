**CRM Contact Management - Proof of Concept (PoC)**
*Descrizione del Progetto*
Questo progetto è un Proof of Concept (PoC) di un sistema CRM (Customer Relationship Management), sviluppato per la Start Up Starter srl su commissione di ITS Tech srl. 
L'applicativo si concentra specificamente sul modulo di gestione dei contatti e delle aziende a essi collegate.

*Architettura e Tecnologie Cloud*
L'infrastruttura è interamente ospitata su Microsoft Azure;
ogni ambiente è composto dalle seguenti risorse:

    Front-end: Un Azure App Service dedicato per la gestione dell'interfaccia utente.

    Back-end: Un Azure App Service dedicato all'esposizione delle Web API.

    Database: Un Azure SQL Server per la persistenza dei dati, configurato per essere accessibile esclusivamente dal back-end.

*Gestione del Codice e DevOps*
L'organizzazione del ciclo di vita del software è gestita tramite le pratiche DevOps:

    Version Control: Il codice sorgente è ospitato su repository Git in Azure DevOps.

    Branching Strategy: Separazione netta tra la branch Dev (per gli sviluppi e l'integrazione continua) e la branch master (per le versioni stabili e i rilasci).

    Project Management: Tutte le attività e i task di sviluppo sono censiti e tracciati sulle Azure DevOps Boards.

*Struttura Dati (Entità)*
Il sistema gestisce la raccolta e la catalogazione dei contatti attraverso un database relazionale composto dalle seguenti entità principali:

    Contact: Gestione delle anagrafiche dei contatti (Nome, Cognome, Data di nascita, ecc.).

    Company: Dati delle aziende a cui i contatti possono essere associati (Denominazione, P.IVA, Sito web).

    Category: Categorie di raggruppamento (es. Cliente, Fornitore).

    Recapiti:

        PhoneNumber e Phone Number Type (es. Lavoro, Personale, Emergenza).

        MailAddress e MailAddress Type.

*Funzionalità dell'Applicativo*
Back-end (Web API)

    Operazioni CRUD: Sono implementate le 5 operazioni fondamentali (GetAll, GetSingle, Create, Update, Delete) per ogni singola entità, con i relativi DTO.

    Endpoint Specifici: API per ottenere i dettagli completi di un contatto (inclusi indirizzi email, numeri di telefono ordinati per priorità e categorie), liste di contatti per azienda e filtraggi avanzati per recapiti.

*Front-end (Interfaccia Utente)*
L'interfaccia web è strutturata in una pagina con un menu di navigazione che permette di spostarsi tra le sezioni: Contatti, Aziende, Tipologie Email, Tipologie Numeri.

    Visualizzazione a Griglia: I dati sono presentati in griglie interattive che espongono i campi principali, con possibilità di modifica o eliminazione diretta della riga.

    Dettaglio Aziende (Popup/Lightbox): Permette non solo di modificare i dati dell'azienda, ma anche di visualizzare la lista dei contatti associati e di eseguire operazioni CRUD su di essi direttamente da questo pannello.

    Dettaglio Contatti: Oltre all'anagrafica e all'azienda associata, il pannello permette di aggiungere, modificare e cancellare dinamicamente i numeri di telefono e gli indirizzi email del contatto.