// One container per case. `name` is the accessible name every browser computes (and getByRole finds).
// `source` says where the name comes from; the AI-mode snapshot is expected to print `<role> "<name>"`.
export type Case = { id: string; role: string; name: string; source: string; html: string };

export const CASES: Case[] = [
  // Controls: names that do NOT come from a descendant element (expected to be kept)
  { id: 'A', role: 'region', name: 'Labelled by attribute', source: 'aria-label',
    html: '<section aria-label="Labelled by attribute"><h2>Heading A</h2></section>' },
  { id: 'C', role: 'region', name: 'Heading C outside', source: 'aria-labelledby → heading OUTSIDE the container',
    html: '<h2 id="hc">Heading C outside</h2><section aria-labelledby="hc"><p>body C</p></section>' },
  { id: 'D', role: 'region', name: 'Hidden label D', source: 'aria-labelledby → hidden element inside',
    html: '<section aria-labelledby="hd"><h2>Inner title</h2><span id="hd" hidden>Hidden label D</span></section>' },
  // Names that come from a visible descendant (reported as dropped)
  { id: 'B', role: 'region', name: 'Heading B', source: 'aria-labelledby → visible heading inside',
    html: '<section aria-labelledby="hb"><h2 id="hb">Heading B</h2><p>body</p></section>' },
  { id: 'E', role: 'navigation', name: 'Nav E', source: 'aria-labelledby → visible heading inside',
    html: '<nav aria-labelledby="he"><h2 id="he">Nav E</h2><a href="#e">link</a></nav>' },
  { id: 'F', role: 'dialog', name: 'Delete item?', source: 'aria-labelledby → visible heading inside',
    html: '<dialog open aria-labelledby="hf"><h2 id="hf">Delete item?</h2><button>OK</button></dialog>' },
  { id: 'G', role: 'columnheader', name: 'Price', source: 'content: a sort button inside the header cell',
    html: '<table><thead><tr><th><button>Price</button></th><th>Stock</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>' },
  { id: 'H', role: 'group', name: 'Shipping address', source: 'native: <legend> inside <fieldset>',
    html: '<fieldset><legend>Shipping address</legend><input aria-label="Street"></fieldset>' },
  { id: 'I', role: 'table', name: 'Monthly totals', source: 'native: <caption> inside <table>',
    html: '<table><caption>Monthly totals</caption><tr><td>1</td></tr></table>' },
  { id: 'J', role: 'figure', name: 'Sales chart', source: 'native: <figcaption> inside <figure>',
    html: '<figure><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><figcaption>Sales chart</figcaption></figure>' },
];
