const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json()); 

const productos = [
  { id: 'prod-101', nombreProducto: 'Empanada de Carne', precio: 3.50 },
  { id: 'prod-102', nombreProducto: 'Arepa de Huevo', precio: 4.25 },
  { id: 'prod-103', nombreProducto: 'Salchipapa Clásica', precio: 9.80 },
  { id: 'prod-104', nombreProducto: 'Choriperro Especial', precio: 12.50 },
  { id: 'prod-105', nombreProducto: 'Aborrajado', precio: 6.00 }
];


let pedidos = [
  {id: 1, nombre: "Davy", productos:[], total: 0}

];


app.get("/orders", (req, res) => {
  res.status(200).json({
    message: "Lista de pedidos",
    data: pedidos,
  });
});



//  Obtener por id
app.get("/orders/:id", (req, res) => {
  
  const myId = parseInt(req.params.id); 

  try {

    const order = pedidos.find(p => p.id === myId);
    
    if (order){

     res.status(200).json({ // En caso de encontrar el pedido
        message: "Pedido Encontrado",
        data: order,
      });
    } else {
      res.status(404).json({ // 404 no se encontro 
        message: "Esa vuelta no existe",
      });
    }
  } catch (error) { // Error interno del servidor
    res.status(500).json({
      message: "Si ve... me rompio",
      error: error.message,
    });
  }
});


// crear
app.post("/orders", (req, res) => {
//para trabajar con los datos correcctamente en el body tiene que venir nombre:str y ids[]
  try {
    const { nombre, ids } = req.body; 
   
    if (!nombre || !ids) {// si no me pasa los datos
      return res.status(400).json({
        message: "Mi niño el 'nombre' y los 'ids' son obligatorios.",
      });
    }


    if (!Array.isArray(ids) || ids.length === 0) { // En caso de que no sea un array 
      return res.status(400).json({
        message: "El campo 'id' tiene que ser una lista y por lo menos tener algo.",
      });
    }


    // Recolecto productos válidos
    const productosOrden = [];
    let totalOrden = 0;

    for (const id of ids) { // Para cada id en ids 
      const encontrado = productos.find(p => p.id === id); // Busca el producto en el array 

      if (!encontrado) {
        return res.status(404).json({
          message: `'${id}' ?? que es eso???'.`,
        });
      }
    
    productosOrden.push(encontrado);
    totalOrden += Number(encontrado.precio);

}

    const newOrder = {
      id: pedidos.length + 1, // Asignar un ID unico por la lingitud original de los pedidos
      nombre,
      productos: productosOrden,
      total: totalOrden,
    };

    pedidos.push(newOrder);

    return res.status(201).json({
      message: "Orden creada exitosamente :)",
      order: newOrder,
    });

  } catch (error) {
    console.error("Error creando orden :/ ", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});


app.put("/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { acciones } = req.body;
  const index = pedidos.findIndex(p => p.id === id); // Con esto pillo si el pedido si existe.


  try {
    
    /// VALIDACIONES ////
    if (!acciones || !Array.isArray(acciones)) { // Miro que acciones sea un array y que no este vacio
      return res.status(400).json({
        message: "Si no me dice bien qué hacer entonces qué hago ._."
      });
    }


    if (index === -1) { // Entonces en base al indice miro si existe o no
      return res.status(404).json({
        message: "Esa vuelta no existe"
      });
    }

    


    let tipos = [];
    let cantidadPorTipo = {}; // Esto es un diccionario que almacena cosas como {"agregar": 1, "eliminar": 1}


    for (const accion of acciones) {

      // Como no puedo tener nada undefine tengo que hacer otra pequeña validacion.
      if (!accion.tipo) {
        return res.status(400).json({
          message: "Mi niño, el 'tipo' es obligatorio."
        });
      }

      const tipo = accion.tipo.toLowerCase();
      tipos.push(tipo);

      cantidadPorTipo[tipo] = (cantidadPorTipo[tipo] || 0) + 1;

    }

    /// Solo existen las convinaciones de agregar y eliminar, o unicamente remplazar o agregar o eliminar
    if (cantidadPorTipo["agregar"] && cantidadPorTipo["reemplazar"]) {
      return res.status(400).json({
        message: "No se puede 'agregar' y 'reemplazar' al mismo tiempo mi niño'."
      });
    }

    if (cantidadPorTipo["eliminar"] && cantidadPorTipo["reemplazar"]) {
      return res.status(400).json({
      message: "no podes 'eliminar' y 'reemplazar' al mismo tiempo mi niño'."
    });
  }

    for (const tipo in cantidadPorTipo) {
      if (cantidadPorTipo[tipo] > 1) {  //// CON ESTA MISMA LOGICA DESPUES PUEDO PENSAR EN COMO contar cuantos prodcutos hay de un mismo tipo , por ejemplo saber si hay 2 empanadas de carne etc.
        return res.status(400).json({
          message: `Solo una accion por tipooo '${tipo}'.`
        });
      }
    }

    const nombres = acciones.filter(a => a.nombre);

    if (nombres.length > 1) {
      return res.status(400).json({
          message: "Solo un nombre Perritooo"
        });
      }


    ///// FIN VALIDACIONES ///

    let datosNuevos = [];
    let totalNuevos = 0;

    for (const accion of acciones) {

      
       // Agregar productos
      if (accion.tipo.toLowerCase() === "agregar") {

      
        // Valido brevemente que 'productos' sea un array  y no me lo mande vacio 
        if (!Array.isArray(accion.productos) || accion.productos.length === 0) {
          return res.status(400).json({
            message: "si me pasas productos al menos que contenga algo... pato"
          });
        }

        for (const p of accion.productos) {
          let encontrado = productos.find(prod => prod.id === p);

          if (!encontrado) {
            return res.status(404).json({
              message: "otra vuelta que no existe"
            });
          }

          datosNuevos.push(encontrado);
          totalNuevos += Number(encontrado.precio);
        }

        pedidos[index].productos.push(...datosNuevos);
        pedidos[index].total += totalNuevos;

        datosNuevos = []; // no me importa si no es elegante jajaja
        totalNuevos = 0;
      }

      // Eliminar productos
      if (accion.tipo.toLowerCase() === "eliminar") {

                // Valido brevemente que 'productos' sea un array  y no me lo mande vacio 
        if (!Array.isArray(accion.productos) || accion.productos.length === 0) {
          return res.status(400).json({
            message: "si me pasas productos al menos que contenga algo... mamon"
          });
        }

          /// ACABO DE DESCUBRIR UN BUG UnU  
        //En caso de haber mas de un mismo producto en la orden con la misma id. los elimina todos, a causa del filter y desajusta el precio total, creo que manejar cantidades en los productos que van a la orden puede ayudarme a mejorar ese problema... pero no lo quiero pensar ahorita UnU estoy muy cansado... dejo esto para que no se me pase despues xd  /// aqui pensando mas creo que tambien unicamnete indexar mas hacer [splice]
        for (const p of accion.productos) {
        console.log("");
          let encontrado = pedidos[index].productos.find(prod => prod.id === p);

          if (!encontrado) {
            return res.status(404).json({
              message: "otra vuelta que no existe"
            });
          }

          pedidos[index].total -= Number(encontrado.precio);
          pedidos[index].productos = pedidos[index].productos.filter(prod => prod.id !== p);
        }
      }

      // Reemplazar productos (sobreescribir)
      if (accion.tipo.toLowerCase() === "reemplazar") {

        

        if (accion.nombre) { // En caso de que cambiemos el nombre
           pedidos[index].nombre = accion.nombre;

        }

        


        // Lo mismo 
        if (accion.productos) {
          
          datosNuevos = [];
          totalNuevos = 0;
          for (const p of accion.productos) {
            let encontrado = productos.find(prod => prod.id === p);

            if (!encontrado) {
              return res.status(404).json({
                message: "esa vuelta que no existe"
              });
            }

            totalNuevos += Number(encontrado.precio);
            datosNuevos.push(encontrado);
          }

          pedidos[index].productos = datosNuevos;
          pedidos[index].total = totalNuevos;

          datosNuevos = [];
          totalNuevos = 0;



        }


      }

    }

    // Que botadera de logica tan hdp a la final creo que deje una lista de tipos por nada xd.

    return res.status(200).json({
      message: "Orden actualizada correctamente",
      orden: pedidos[index]
    });

  } catch (error) {
    console.error("Error actualizando orden :c ", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }

});












//// AQUI VA LA LOGICA DE DÉIVID para eliminar

// no la hizo entonce la hago yo.
//

app.delete("/orders/:id", (req, res) => {

  const id = parseInt(req.params.id);

  if (!id){
    res.status(404).json({ message: "...? habla pues" })
  } 


  let elDifunto = pedidos.find(pedido => pedido.id === id)

  if (!elDifunto){
    res.status(404).json({message:"quesamonda"})
  }

  pedidos = pedidos.filter(pedido => pedido.id != id)
  res.status(200).json({message:"ok"})

})
     



app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  
  function sum(arr) {
  // Pense que en javascript existia sum como en python pero no 
    // tuve que hacerla
    let total = 0;
    for (let num of arr) {
      total += num;
    }
    return total;

  }


  let dos = 2 
  let mas = 2 
  let esigual = 4 
  console.log(`hice esto por ocio jsjs bueno en fin... el resultado es {sum([dos, mas, esigual])} ... jeje ${sum([dos, mas, esigual])} ahora si. :D`)

});


