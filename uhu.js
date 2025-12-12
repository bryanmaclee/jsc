const a = 3;

{
   lin b = 5 + a;
   console.log(`b is eqaul to: ${b}`);
}
const c = b + 2;
console.log(b); // b is undeclared
console.log(`c is equal to: ${c}`);
