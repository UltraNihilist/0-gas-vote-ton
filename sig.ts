let signature = 'H2C0dl9y9ezS3zcvW6UjE67/y9WmTpVcjAq+M/WHVWmzIZIA1A2L9VB9QsP7BDfZoZzcAFsFzlORFk7ZqYpW7f0=';
let sig = Buffer.from(signature, 'base64');
let hexSig = sig.toString("hex");
console.log(hexSig);
let v = hexSig.slice(0,2);
console.log(v);
let r = hexSig.slice(2,2+64);
console.log(r);
let s = hexSig.slice(66,66+64);
console.log(s);