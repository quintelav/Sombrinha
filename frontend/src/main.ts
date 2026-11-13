import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');

if (!target) {
  throw new Error('Elemento raiz do Sombrinha não encontrado.');
}

mount(App, { target });
