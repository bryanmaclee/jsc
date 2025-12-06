export function Environment(e = false, name = "global", type = "global") {
   const global = e ? false : true;
   const linAr = [];
   let Lineage;
   if (global) {
      Lineage = [];
   } else {
      Lineage = Array.from(e.Lineage);
      Lineage.push(e.Name);
   }
   const Name = name;
   const Type = type;
   const Variables = new Map();
   const UnUtilizedVars = new Set();
   const Constants = new Set();
   const DumbVars = new Set();
   const Functions = new Set();
   const FunctionStrs = new Map();
   const Types = new Map();
   const Children = [];

   function declareVar(name, kind) {
      if (kind === "const") {
         Constants.add(name);
      } else if (kind === "var") {
         DumbVars.add(name);
         // hoistVar(name, value, Lineage);
      }
      UnUtilizedVars.add(name);
   }

   function assignVar(name, value) {
      if (Constants.has(name) && Variables.has(name)) {
         console.log(`cannot reasign to constant ${name}`);
         return;
      }
      Variables.set(name, value);
   }

   function assignFn(name) {
      if (Functions.has(name)) {
         console.log(`function ${name} has already been declared`);
      }
      Functions.add(name);
   }

   function getVar(name) {
      UnUtilizedVars.delete(name);
      return Variables.get(name);
   }

   return {
      Lineage,
      Type,
      Name,
      Variables,
      UnUtilizedVars,
      Constants,
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
