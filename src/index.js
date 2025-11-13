const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json()); 

const productos = [
  { id: 'prod-101', nombre: 'Empanada de Carne', precio: 3.50 },
  { id: 'prod-102', nombre: 'Arepa de Huevo', precio: 4.25 },
  { id: 'prod-103', nombre: 'Salchipapa Clásica', precio: 9.80 },
  { id: 'prod-104', nombre: 'Choriperro Especial', precio: 12.50 },
  { id: 'prod-105', nombre: 'Aborrajado', precio: 6.00 }
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
        message: "Mi niño, el 'nombre' y los 'ids' son obligatorios.",
      });
    }


    if (!Array.isArray(ids) || ids.length === 0) { // En caso de que no sea un array 
      return res.status(400).json({
        message: "El campo 'id' tiene que ser un arreglo y por lo menos tener algo.",
      });
    }


    // Recolecto productos válidos
    const productosOrden = [];
    let totalOrden = 0;

    for (const id of ids) { // Para cada id en ids 
      const encontrado = productos.find(p => p.id === id); // Busca el producto en el array 

      if (!encontrado) {
        return res.status(404).json({
          message: `'${requestedId}?? que es eso???'.`,
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
  const idActualizar = parseInt(req.params.id);
  const { acciones } = req.body;

  if (!acciones || !Array.isArray(acciones)) { // Si no acciones o acciones no es array
    return res.status(400).json({
      message: "Si no me dice bien que hacer entonces que hago ._."
    });
  }

  const index = pedidos.findIndex(p => p.id === idActualizar); // La posición de ese pedido en el array 

  if (index === -1) {
    return res.status(404).json({
      message: "Esa vuelta no existe"
    });
  }



  let datosNuevos = [];
  let totalNuevos = 0;

  for (const accion of acciones) {

    if (accion.nombre) {
      pedidos[index].nombre = accion.nombre;
    }

    if (toLowerCase(accion.tipo) === "agregar") {

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

    }

  }
});












  //if ("id" in datosNuevos || "total" in datosNuevos){
   // return res.status(400).json({
     // message: "Jajaja pobre estupido"
   // })
 // }


   

  if (isNaN(idActualizar) || index === -1){
    return res.status(404).json({
      massage: "Invalido manito"
    })
  }


  if ("nombre" in datosNuevos){
    pedidos[index].nombre = datosNuevos.nombre;
  }


  if ("productos" in datosNuevos){ 
    
    if ("agregar" in datosNuevos)

    
    let pedidoActualizar = pedidos[index]; // Utilizo el indice para obtener el pedido a actualizar
    let nuevaOrden = pedidoActualizar.productos; // Productos deberia ser una lista de productos
    let nuevoTotal = pedidoActualizar.total; 


  
  // Pensar en como sobreescribir con los datos nuevos

}


  
  

















  // Pensar en como trabajar con los datos nuevos.
  // Toca coger los precios de los ids que el esta pasando en la actualizacion y sumarlos 
  // para el nuevo precio total

     



app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


