// Cucina · KDS v2 — montaggio
//
// Niente sidebar e niente shell del gestionale: questo schermo non è una pagina
// che un ristoratore visita, è un dispositivo appeso in cucina che fa una cosa
// sola. La navigazione del gestionale, su un monitor toccato con i guanti, è
// solo superficie da colpire per sbaglio.
//
// Il KDS attuale (`byup Cucina.html`) e la vista Banco restano dove sono: questa
// route non li importa, non li modifica e non condivide stato con loro.

const kds2Root = ReactDOM.createRoot(document.getElementById('root'));
kds2Root.render(
  <div className="frame" data-screen-label="Cucina · KDS v2">
    <Kds2Board/>
  </div>
);
