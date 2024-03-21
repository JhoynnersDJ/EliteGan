import { Proyecto } from "../model/ProyectoModel.js";
import { user } from "../../usuarios/model/UserModel.js";
import  tarea  from "../../tareas/model/TareaModel.js";
import { ResponsableClienteReplica } from "../../responsables_clientes/model/responsable_clienteModel.js";
import date from "date-and-time";
import puppeteer from "puppeteer";
import { calcularDiferenciaDeTiempo } from "../../tareas/libs/Tarifa.js";

class ProyectoController {
  // devuelve todos los registros
  static async index(req, res) {
    try {
      // Buscar todos los registros
      const proyectos = await Proyecto.findAll();
      // si no se encuentran registros en la base de datos
      if (!proyectos) {
        return res
          .status(204)
          .json({ message: "No hay proyectos registrados" });
      }
      // devuelve una respuesta
      res.status(200).json(proyectos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // devuelve un unico registro segun su primary key
  static async getById(req, res) {
    try {
      // capturar id de proyecto
      const { id } = req.params;
      // buscar el proyecto segun su id junto con los datos de sus modelos asociados
      const proyecto = await Proyecto.findByPk(id);
      // comprobar si existe el proyecto
      if (!proyecto) {
        return res.status(404).json({
          code: "Recurso no encontrado",
          message: "Proyecto no encontrado",
          details:
            "Proyecto con el id " + id + " no se encuentra en la base de datos",
          timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          requestID: id,
        });
      }
      res.status(200).json(proyecto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // devuelve los proyectos segun el id usuario
  static async getByUser(req, res) {
    try {
      // capturar id de usuario
      const { id } = req.params;
      // comprobar si existe el usuario
      const userFound = await user.findOneById(id);
      if (!userFound) {
        return res.status(404).json({
          code: "Recurso no encontrado",
          message: "Usuario no encontrado",
          details:
            "Usuario con el id " + id + " no se encuentra en la base de datos",
          timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          requestID: id,
        });
      }
      // buscar el proyecto segun el id del usuario
      const proyectos = await Proyecto.findByUser(id);
      // si no se encuentran proyectos
      if (!proyectos) {
        return res
          .status(204)
          .json({ message: "Este usuario no tiene proyectos" });
      }
      // enviar los datos
      res.status(200).json(proyectos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // crear un proyecto
  static async create(req, res) {
    try {
      // capturar
      const {
        tarifa,
        pool_horas,
        fecha_fin,
        id_responsable_cliente,
        tecnicos,
      } = req.body;
      let { nombre } = req.body;
      // eliminar espacios en blanco del string
      nombre = nombre.trim();
      // establecer status false/0
      const status = 0;
      // comprobar si existe el usuario
      for (const tecnico of tecnicos) {
        const usuario = await user.findOneById(tecnico.id_usuario);
        if (!usuario) {
          return res.status(404).json({
            code: "Recurso no encontrado",
            message: "Id de usuario no encontrado",
            details: `Usuario con el id '+ ${tecnico.id_usuario} + ' no se encuentra en la base de datos`,
            timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
            requestID: tecnico.id_usuario,
          });
        }
      }
      // comprobar si existe el responsable cliente
      const responsableClienteFound = await ResponsableClienteReplica.findByPk(
        id_responsable_cliente
      );
      if (!responsableClienteFound) {
        return res.status(404).json({
          code: "Recurso no encontrado",
          message: "Responsable cliente no encontrado",
          details:
            "El responsable cliente con el id " +
            id_responsable_cliente +
            " no se encuentra en la base de datos",
          timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          requestID: id_responsable_cliente,
        });
      }
      // verificar que no exista otro proyecto con el mismo nombre para el mismo cliente
      const proyectoExistente = await Proyecto.findOneName(
        nombre,
        id_responsable_cliente
      );
      if (proyectoExistente) {
        return res.status(400).json({
          message:
            "El responsable cliente ya tiene un proyecto con el mismo nombre",
        });
      }
      // fecha de inicio
      const now = new Date();
      const fecha_inicio = date.format(now, "YYYY-MM-DD");
      // fecha_fin
      let fin = new Date(fecha_fin);
      fin = date.format(fin, "YYYY-MM-DD");
      if (fin < fecha_inicio) {
        return res.status(400).json(
          {
            message:
              "Fecha de fin no válida, verifique que sea posterior a la fecha de creación",
          },
          {
            code: "Bad Request",
            message: "Fecha inválida",
            details:
              "La fecha de finalización debe ser posterior a la fecha de creación",
            timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
            requestID: fecha_fin,
          }
        );
      }
      // instanciar un objeto de la clase proyecto
      const proyecto = new Proyecto(
        nombre,
        tarifa,
        status,
        pool_horas * 60,
        fecha_inicio,
        fecha_fin,
        id_responsable_cliente,
        tecnicos
      );
      // guardar en la base de datos y actualiza la tabla asignaciones
      await Proyecto.create(proyecto);
      res.status(201).json({ message: "Proyecto creado correctamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // concretar un proyecto
  static async concretarProyecto(req, res) {
    try {
      // capturar id de proyecto
      const { id } = req.params
      // cambiar status a completado
      const status = 1
      // comprobar si existe el proyecto
      const proyectoExistente = await Proyecto.findByPk()
      if (!proyectoExistente) {
        return res.status(404).json({
          code: "Recurso no encontrado",
          message: "Proyecto no encontrado",
          details: "Proyecto con el id " + id + " no se encuentra en la base de datos",
          timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          requestID: id,
          });
      }
      // actualiza el status del proyecto a completado
      await Proyecto.concretarProyecto(id)
      // actualiza el status de las tareas asociadas a completado
      await tarea.concretarProyecto(id)
      res.status(200).json({ message: "Proyecto concretado correctamente" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  // eliminar un proyecto
  static async delete(req, res) {
    try {
      // capturar id de proyecto
      const { id } = req.params;
      // comprobar si existe el proyecto
      const projectFound = await Proyecto.findByPk(id);
      if (!projectFound) {
        return res.status(404).json({
          code: "Recurso no encontrado",
          message: "Proyecto no encontrado",
          details:
            "Proyecto con el id " + id + " no se encuentra en la base de datos",
          timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          requestID: id,
        });
      }
      // eliminar un proyecto de la base de datos
      await Proyecto.delete(id);
      res.status(200).json({ message: "Proyecto eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // static async pdf(req, res) {
  //   try {
  //     // capturar datos
  //     const { id } = req.params;
  //     // buscar el proyecto segun su id junto con el nombre del tecnico responable
  //     const project = await Proyecto.findByPk(id, {
  //       include: [
  //         {
  //           model: Tarea,
  //           attributes: [
  //             "id_tarea",
  //             "fecha",
  //             "hora_inicio",
  //             "hora_fin",
  //             "total_hora",
  //           ],
  //           include: [
  //             {
  //               model: Servicio,
  //               attributes: ["nombre"],
  //             },
  //           ],
  //         },
  //         {
  //           model: ReplicaResponsableCliente,
  //           attributes: ["nombre_responsable_cl"],
  //           include: [
  //             {
  //               model: ClienteReplica, // Incluye la asociación ReplicaResponsableCliente dentro de ClienteReplica
  //               attributes: ["nombre_cliente"], // Selecciona los atributos deseados de ReplicaResponsableCliente
  //             },
  //           ],
  //         },
  //         {
  //           model: Usuario,
  //           attributes: ["nombre", "apellido"],
  //         },
  //       ],
  //     });
  //     // comprobar si existe el proyecto
  //     if (project == null) {
  //       return res.status(404).json({ message: "Proyecto no Seleccionado" });
  //     }
  //     if (!project) {
  //       return res.status(404).json({ message: "Proyecto no encontrado" });
  //     }
  //     // Generar el PDF y obtener la ruta del archivo
  //     const pdfPath = await crearPDF(id, project);

  //     const pdfContent = fs.readFileSync(pdfPath);
  //     res.contentType("application/pdf");
  //     res.send(pdfContent);
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // }

  static async generarPDFProyectoSimple(req, res) {
    try {
      // Capturar el id_proyecto de los parámetros de la solicitud
      const { id } = req.params;

      // Verificar si se proporcionó el id_proyecto
      if (!id) {
        return res
          .status(400)
          .json({ message: "Falta el parámetro id_proyecto" });
      }
      const project = await Proyecto.findByPkPDF(id);

      // Comprobar si el proyecto existe
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }

      // Configurar el contenido HTML que se va a renderizar en el PDF
      const content = `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>Reporte</title>
        </head>
        
        <body>
            <div class="flex flex-col justify-between my-8 mx-8">
                <!-- Encabezado -->
                <div class="flex justify-between items-center border-2 border-sky-500 rounded-2xl my-6 px-4">
                    <!-- Logo -->
                    <div class="flex p-4">
                <h2 class="text-2xl font-bold text-center">Hormi<span class="text-sky-500">Watch</span></h2>
                    </div>
                    <!-- Titulo -->
                    <div class="p-4">
                        <h1 class="text-xl font-bold text-center text-gray-800">Reporte de Atencion al Cliente</h1>
                    </div>
                    <!-- Datos Solicitud -->
                    <div class="text-right border-l-2 h-24 border-sky-500 flex flex-col p-4 justify-center">
                        <p
                        class="text-sm font-bold text-gray-800"
                        >Fecha:
                            <span class="font-normal">
                            ${new Date().toLocaleDateString()}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800">
                            Codigo Proyecto:
                            <span class="font-normal">
                            ${project.id_proyecto.split('-')[0]}
                            </span>
                        </p>
                    </div>
                </div>
                <!-- Datos del Cliente -->
                <h6 class="text-left font-bold">
                <div class="flex justify-between items-center border-2 border-sky-500 rounded-2xl">
                <div class="flex flex-col w-1/2 gap-y-2 py-2">
                    <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                        Nombre: 
                        <span class="font-normal">${
                          project.nombre_cliente
                        }</span>
    
                    </p>
                        </p>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            Codigo Cliente:
                            <span class="font-normal">
                            ${project.id_cliente.split('-')[0]}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800 px-2">
                            Departamento:
                            <span class="font-normal">
                            ${project.departamento_responsable_cliente}
                            </span>
                        </p>
                    </div>
                    <div class="flex flex-col border-l-2 w-1/2 border-sky-500 gap-y-2 py-2">
                       <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            Responsable Cliente:
                            <span class="font-normal">
                            ${project.nombre_responsable_cliente}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            Cargo:
                            <span class="font-normal">
                            ${project.cargo_responsable_cliente}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800 px-2">
                            Telefono:
                            <span class="font-normal">
                            ${project.telefono_responsable_cliente}
                            </span>
                       </p> 
                    </div>
                </div>
                <!-- Datos del Proyecto  -->
                <h6 class="text-left font-bold">
                    2. Datos del Proyecto
                </h6>
                <div class="flex flex-col gap-y-2 py-2 border-2 border-sky-500 rounded-2xl">
                    <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                        Nombre del Proyecto:
                        <span class="font-normal">
                        ${project.nombre_proyecto}
                        </span>
                    </p>
                    <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                        Fecha de Inicio:
                        <span class="font-normal">
                        ${project.fecha_inicio}
                        </span>
                    </p>
                    <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                        Pool de Horas Asignadas
                        <span class="font-normal">
                        ${project.pool_horas}
                        </span>
                    </p>
                    <p class="text-sm font-bold text-gray-800 px-2 border-b-[1px] border-gray-600">
                        Tarifa por Hora:
                        <span class="font-normal">
                        ${project.tarifa}
                        </span>
                    </p>
                    <p class="text-sm font-bold text-gray-800 px-2">
                        Tecnico Asignado:
                        <span class="font-normal">
                        ${project.usuarios[0].nombre} ${
        project.usuarios[0].apellido
      }
                        </span>
                    </p>
                </div>
                <!-- Detalles del Proyecto -->
                <h6 class="text-left font-bold">
                    3. Detalles del Proyecto
                </h6>
                <div class="flex flex-col gap-y-2 py-2 border-2 border-sky-500 rounded-2xl">
                    <!-- Encabezado de la tabla explicando la Leyenda de la columna estatus -->
                    <p class="text-xs text-gray-800 text-center px-2">
                        Leyenda Columna Estatus:  C= Actividad Culminada /  P= Actividad Pendiente
                    </p>
                    <p class="text-xs text-gray-800 text-center px-2">
                        Horario Oficina <span class="font-bold" >
                            (HO) : Factor = 1
                        </span> / Extrahorario 
                        
                        <span class="font-bold" >
                            (EH) : Factor = 1,5
                        </span>/ Dom y feriado <span class="font-bold" >
                            (DF): Factor = 2
                        </span>
                    </p>
                    <div class="overflow-x-auto px-2">
                        <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-sky-500 text-sky-100">
                            <tr>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Servicio</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Fecha</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Hora Inicio</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Hora Fin</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Total Horas</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Valor de las Horas con Factor</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Estatus</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">Total Tarifa</th>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200 text-gray-800">
                          <!-- Iterar sobre las tareas -->
                          ${project.tareas
                            .map(
                              (tarea) => `
                            <tr>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.servicio.nombre_servicio
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.fecha
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.hora_inicio
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.hora_fin
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                calcularDiferenciaDeTiempo(
                                  tarea.hora_inicio,
                                  tarea.hora_fin
                                ).tiempo_formateado
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.factor_tiempo_total
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.status
                              }</td>
                              <td class="px-2 py-4 whitespace-nowrap text-sm font-normal text-gray-800 text-center border">${
                                tarea.total_tarifa
                              }</td>
                            </tr>
                            `
                            )
                            .join("")}
                          </tbody>
                          <tfoot class="">
                            <tr class="bg-white border-[1px]">
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 "></th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border-2  border-sky-500 bg-sky-500 text-sky-100">Total de Horas</th>
                              <th scope="col" class="px-2 py-3 text-xs font-bold tracking-wider text-center border">${project.total_horas_tareas}</th>
                            </tr>
                        </table>
                      </div>
                </div>
                <!-- Aceptacion -->
                <h6 class="text-left font-bold">
                    4. Aceptacion
                </h6>
                <div class="flex justify-between items-center border-2 border-sky-500 rounded-2xl">
                    <div class="flex flex-col gap-y-2 py-2 w-1/2">
                        <h6 class="text-left font-bold pl-2">
                            Por el Cliente:
                        </h6>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            Nombre del Cliente: 
                            <span class="font-normal">
                            ${project.nombre_cliente}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            C.I:
                            <span class="font-normal">
                                123456
                            </span>
                        <p class="text-sm font-bold text-gray-800 px-2">
                            Firma: 
                            <span class="font-normal">
                                _________
                            </span>
                        </p>
                    </div>
                    <div class="flex flex-col gap-y-2 py-2 w-1/2 border-l-2 border-sky-500">
                        <h6 class="text-left font-bold pl-2">
                            Por el Tecnico:
                        </h6>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            Nombre del Tecnico: 
                            <span class="font-normal">
                                <!-- Muestra todos los usuarios del array -->
                                ${project.usuarios
                                  .map(
                                    (usuario) => `
                                      ${usuario.nombre} ${usuario.apellido}
                                      `
                                  )
                                  .join(", ")}
                            </span>
                        </p>
                        <p class="text-sm font-bold text-gray-800 border-b-[1px] border-gray-600 px-2">
                            C.I:
                            <span class="font-normal">
                               <!-- Muestra todos las cedulas de los usuarios -->
                                ${project.usuarios
                                  .map((usuario) => ` ${usuario.cedula}`)
                                  .join(", ")}
                            </span>
                        </p>  
                                                            <!-- Genera espacio de firmas por cada usuario -->
                                        <p class="text-sm font-bold text-gray-800 px-2">
                                        Firma: 
                                        <span class="font-normal">
                                           ______________________________________________________
                                        </span>
                                        </p>
          

                    </div>
                </div>
                <!-- Cierre -->
                <div class="flex flex-col gap-y-2 my-4 py-2 border-2 border-sky-500 rounded-2xl">
                    <p class="p-2">
                        Al firmar este reporte como receptor del servicio prestado, el cliente acepta y está conforme con el
                        mismo, así como que ha verificado su efectiva ejecución. Los términos para el posterior pago de la
                        correspondiente factura, si el caso amerita, será según las tarifas vigentes para el tipo de servicio
                        prestado y/o cotizado, previamente autorizado por el Cliente.
                    </p>
                </div>
            </div>
        </div>
        </body>
        
        </html>
        `;

      // Crear una instancia del navegador con Puppeteer
      const browser = await puppeteer.launch();

      // Abrir una nueva página
      const page = await browser.newPage();

      // Establecer el contenido HTML de la página
      await page.setContent(content);

      // Generar el PDF en formato A4
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      // Cerrar el navegador
      await browser.close();

      // Enviar el PDF como respuesta HTTP
      res.contentType("application/pdf");
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default ProyectoController;
