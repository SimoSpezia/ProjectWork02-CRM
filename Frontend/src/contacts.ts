import { hidePanel, showPanel } from "./common.js";
import {
    ContactDto,
    ContactUpsertPayload,
    getContact,
    createContact,
    deleteContact,
    updateContact
} from "./apiContact.js";

const tableBody = document.getElementById("table-contact-body") as HTMLTableSectionElement | null;

const addButton = document.getElementById("add-contact-btn") as HTMLButtonElement | null;
const addPanel = document.getElementById("add-contact-panel") as HTMLElement | null;
const addForm = document.getElementById("add-contact-form") as HTMLFormElement | null;
const addCancelButton = document.getElementById("cancel-add-contact") as HTMLButtonElement | null;
const addError = document.getElementById("add-contact-error") as HTMLParagraphElement | null;
const addContactsList = document.getElementById("add-contact-contacts-list") as HTMLDivElement | null;
const addContactRowButton = document.getElementById("add-contact-contact-row") as HTMLButtonElement | null;

const editPanel = document.getElementById("edit-contact-panel") as HTMLElement | null;
const editForm = document.getElementById("edit-contact-form") as HTMLFormElement | null;
const editCancelButton = document.getElementById("cancel-edit-contact") as HTMLButtonElement | null;
const editError = document.getElementById("edit-contact-error") as HTMLParagraphElement | null;
const editContactsList = document.getElementById("edit-contact-contacts-list") as HTMLDivElement | null;
const editContactRowButton = document.getElementById("edit-contact-contact-row") as HTMLButtonElement | null;

const popupOverlay = document.getElementById("contact-popup-overlay") as HTMLDivElement | null;
const popupTitle = document.getElementById("contact-popup-title") as HTMLHeadingElement | null;
const popupMessage = document.getElementById("contact-popup-message") as HTMLParagraphElement | null;
const popupCancelButton = document.getElementById("contact-popup-cancel") as HTMLButtonElement | null;
const popupConfirmButton = document.getElementById("contact-popup-confirm") as HTMLButtonElement | null;