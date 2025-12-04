export function Environment(e = false, name = "global") {
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
   const Variables = new Map();
   const UnUtilizedVars = new Set();
   const Constants = new Set();
   const Functions = new Set();
   const FunctionStrs = new Map();
   const Types = new Map();
   const Children = [];

   function declareVar(name, value, kind) {
      Variables.set(name, value);
      if ((kind = "const")) {
         Constants.add(name);
      }
      UnUtilizedVars.add(name);
   }

   function utilizeVar(name) {
      UnUtilizedVars.delete(name);
   }

   function assignVar(name, value) {
      if (Constants.has(name)) {
         console.log(`cannot reasign to constant ${name}`);
         return;
      }
      console.log("got here. not the prob");
      Variables.set(name, value);
   }

   function assignFn(name) {
      if (Functions.has(name)) {
         console.log(`function ${name} has already been declared`);
      }
      Functions.add(name);
   }

   return {
      Lineage,
      Name,
      Variables,
      UnUtilizedVars,
      Constants,
      Functions,
      FunctionStrs,
      Types,
      Children,
      declareVar,
      utilizeVar,
      assignVar,
      assignFn,
   };
}
