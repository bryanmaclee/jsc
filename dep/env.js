import err from "./error.js";

export function Environment(e = false, name = "global", type = "global") {
   const global = e ? false : true;
   const linAr = [];
   let Lineage;
   if (global) {
      Lineage = [];
   } else {
      Lineage = Array.from(e.Lineage);
      Lineage.push(e.Children.length);
   }
   const Name = name;
   const Type = type;
   const Variables = new Map();
   const UnUtilizedVars = new Set();
   const Constants = new Set();
   const UnsetConstants = new Set();
   const Linears = new Set();
   const UnsetLinears = new Set();
   const DumbVars = new Set();
   const Functions = new Map();
   const FunctionStrs = new Map();
   const Types = new Map();
   const Children = [];

   function declareVar(name, kind) {
      if (kind === "const" || kind === "lin") {
         const t = kind === "const" ? UnsetConstants : UnsetLinears;
         t.add(name);
      } else if (kind === "var") {
         DumbVars.add(name);
         // hoistVar(name, value, Lineage);
      }
      UnUtilizedVars.add(name);
   }

   function assignVar(name, value, kind) {
      if (kind === "const" || kind === "lin") {
         let t = kind === "const" ? Constants : Linears;
         if (t.has(name) && Variables.has(name)) {
            err(`cannot reasign to constant ${name}`, 1);
            return;
         }
         const d = t === Constants ? UnsetConstants : UnsetLinears;
         if (d.delete(name)) {
            t.add(name);
         } else {
            err(`${kind} ${name} dose not exist`, 1);
         }
      }
      Variables.set(name, value);
   }

   function assignFn(name, exp) {
      if (Functions.has(name)) {
         console.log(`function ${name} has already been declared`);
      }
      Functions.set(name, exp);
   }

   function getVar(name) {
      UnUtilizedVars.delete(name);
      if (!Variables.has(name)) {
         err(`variable '${name}' dose not exist`, 1);
      }
      const v = Variables.get(name);
      if (Linears.delete(name)) {
         Variables.delete(name);
      }
      return v;
   }

   return {
      Lineage,
      Type,
      Name,
      Variables,
      UnUtilizedVars,
      Constants,
      UnsetConstants,
      DumbVars,
      Functions,
      FunctionStrs,
      Types,
      Children,
      declareVar,
      getVar,
      assignVar,
      assignFn,
   };
}

function hoistVar(scopes = 0, lin) {
   if (scopes) {
      console.log(`hoist ${scopes} scopes up`);
   } else {
      console.log(`hoist to function scope`);
   }
   console.log(lin);
}
