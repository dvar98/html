document.addEventListener("DOMContentLoaded", function () {
  const graph_container = document.getElementById("graph-container");

  const all_inputs = document.querySelector("info-box-content input");
  const nombre_input = document.getElementById("nombre_input");
  const duracion_input = document.getElementById("duracion_input");
  const costo_input = document.getElementById("costo_input");
  const prerequisito_input = document.getElementById("prerequisito_input");
  const postrequisito_input = document.getElementById("postrequisito_input");

  const tiempoLink_input = document.getElementById("tiempo_input");
  const nodoInicio_input = document.getElementById("inicio_input");
  const nodoFin_input = document.getElementById("fin_input");

  const node_attr = "stroke-width: 1; stroke: rgb(51, 51, 51); fill: rgb(161 204 245); cursor: move;";
  const nodeLabel_attr = "text-anchor: middle; dominant-baseline: central; color: black;";
  const link_attr = "cursor: pointer;"

  // Configuración de la visualización
  const width = graph_container.offsetWidth
  const height = graph_container.offsetHeight

  console.log(graphData);

  // Crear el lienzo SVG para la visualización
  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("style", `width: ${width}; height: ${height}`)

  // Crear un grupo para las líneas de los enlaces
  const linkGroup = svg.append("g").attr("id", "linkGroup");

  // Crear un grupo para los nodos y etiquetas
  const nodeGroup = svg.append("g").attr("id", "nodeGroup");

  // Crear una simulación de fuerza para los nodos
  const simulation = d3.forceSimulation(graphData.nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force("link", d3.forceLink(graphData.links).distance(100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Crear los enlaces (conexiones)
  let links = linkGroup.selectAll(".link")
    .data(graphData.links)
    .enter().append("line")
    .attr("class", "link")
    .attr("style", link_attr)
    .attr("stroke", "#444")
    .attr("stroke-width", 8);


  // Crear los nodos
  let nodes = nodeGroup.selectAll(".node")
    .data(graphData.nodes)
    .enter().append("circle")
    .attr("class", "graph-node")
    .attr("r", 20)
    // .attr("fill", "rgb(0, 100, 199)")
    .attr("style", node_attr)
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragging)
      .on("end", dragEnded));

  // Agregar etiquetas a los nodos
  let nodeLabels = nodeGroup.selectAll(".node-label")
    .data(graphData.nodes)
    .enter().append("text")
    .attr("class", "node-label invisible")
    .text(d => `${d.id}: ${d.name}`) //Texto a colocar en el label
    .attr("style", nodeLabel_attr)

  // Actualizar la simulación en cada fotograma
  simulation.on("tick", () => {
    links
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodes
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    nodeLabels
      .attr("x", d => d.x)
      .attr("y", d => d.y);

  });

  // Habilitar arrastre de nodos
  const drag = d3.drag()
    .on("start", dragStarted)
    .on("drag", dragging)
    .on("end", dragEnded);

  // Aplicar la función de arrastre a los nodos
  nodes.call(drag);

  // Funciones de arrastre
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  info();

  const addNodeButton = document.getElementById("add-node-button");
  if (addNodeButton) {
    addNodeButton.addEventListener("click", openNodePopup);
  }

  document.getElementById("add-node-button").addEventListener("click", openNodePopup);

  function openNodePopup() {
    const nodeName = prompt("Ingrese el nombre del nuevo nodo:");
    const duration = parseInt(prompt("Ingresa la duracion : "));
    const cost = parseInt(prompt("Ingresa costo : "));
    if (nodeName) {
      const newNode = {
        id: graphData.nodes.length,
        name: nodeName,
        duration: duration,
        cost: cost,
        prerequisites: [],
        postrequisites: []
      };

      graphData.nodes.push(newNode);
      simulation.nodes(graphData.nodes);
      simulation.alpha(1).restart();
      updateVisualization(); // ¡Asegúrate de que esta línea esté presente!
    }

  }

  // Configurar el evento click para agregar aristas
  const addEdgeButton = document.getElementById("add-edge-button").addEventListener("click", () => {
    let sourceNodeId = prompt("Ingrese el ID del nodo de origen:");
    let targetNodeId = prompt("Ingrese el ID del nodo de destino:");

    openEdgePopup(sourceNodeId, targetNodeId)
  });

  function openEdgePopup(sourceNodeId, targetNodeId) {

    sourceNode = graphData.nodes.find(node => node.id === parseInt(sourceNodeId));
    targetNode = graphData.nodes.find(node => node.id === parseInt(targetNodeId));

    if (sourceNode && targetNode) {
      addLink(sourceNode, targetNode);
    } else {
      alert("Nodos no encontrados. Asegúrese de ingresar IDs válidos.");
    }
  }

  //Eliminar Nodo
  const deleteNodeButton = document.getElementById("delete-node-button")
  deleteNodeButton.addEventListener("click", deleteNodePopup);

  function deleteNodePopup() {
    let deleteNodeId = parseInt(prompt("Ingrese el ID del nodo a eliminar:"));

    if (isNaN(deleteNodeId)) {
      alert('ID de nodo no válido');
      return;
    }

    const nodeIndex = graphData.nodes.findIndex(node => node.id === deleteNodeId);

    if (nodeIndex === -1) {
      alert('Nodo no encontrado');
    } else {
      graphData.nodes.splice(nodeIndex, 1);
      graphData.links = graphData.links.filter(link => link.source.id !== deleteNodeId && link.target.id !== deleteNodeId);

      updateVisualization();
    }
  }

  //modificar nodo
  const modifyNodeButton = document.getElementById("modify-node-button")
  modifyNodeButton.addEventListener("click", modifyNodePopup);

  function modifyNodePopup() {
    let modifyNodeId = parseInt(prompt("Ingrese el ID del nodo a modificar:"));
    let node = graphData.nodes[modifyNodeId]
    if (node) {
      node.name = prompt('Ingrese el nombre modificado:')
      node.duration = parseInt(prompt('Ingrese la duracion del nodo moficado'));
      node.cost = parseInt(prompt('Ingrese el costo del nodo modificado:'));
    };
    updateVisualization();

  }


  // Función para agregar un enlace entre dos nodos
  function addLink(source, target) {
    // Verificar si el enlace ya existe
    const linkExists = graphData.links.some(link => {
      return (link.source === source.id && link.target === target.id);
    });

    // Si no existe, agregarlo
    if (!linkExists) {
      const sourceNode = graphData.nodes.find(node => node.id === source.id);
      const targetNode = graphData.nodes.find(node => node.id === target.id);

      if (sourceNode && targetNode) {
        if (source.id < target.id) {
          sourceNode.postrequisites.push(target.id);
          targetNode.prerequisites.push(source.id);
        } else if (source.id > target.id) {
          targetNode.postrequisites.push(source.id);
          sourceNode.prerequisites.push(target.id);
        }

        graphData.links.push({ source: source.id, target: target.id });
        updateVisualization();
      }
    }
  }

  const deleteLinkButton = document.getElementById("delete-edge-button")
  deleteLinkButton.addEventListener("click", () => {
    let link1 = parseInt(prompt("Ingrese el ID del nodo inicio del arista"));
    let link2 = parseInt(prompt("Ingrese el ID del nodo fin del arista"));

    deleteLink(link1, link2)
  })

  function deleteLink(link1, link2) {
    graphData.links = graphData.links.filter(function (link) {
      if (link.source.id !== link1) {
        return link
      } else if (link.target.id !== link2) {
        return link
      }
    });
    updateVisualization()
  }

  const updateLinkButton = document.getElementById("modify-edge-button")
  updateLinkButton.addEventListener("click", updateLink)

  function updateLink() {
    let link1 = parseInt(prompt("Ingrese el ID del nodo inicio del arista a actualizar"));
    let link2 = parseInt(prompt("Ingrese el ID del nodo fin del arista a actualizar"));

    const newLink1 = parseInt(prompt("Ingrese el nuevo ID del nodo inicio del arista"));
    const newLink2 = parseInt(prompt("Ingrese el nuevo ID del nodo fin del arista"));

    deleteLink(link1, link2)
    openEdgePopup(newLink1, newLink2)

    console.log(graphData.links)

    updateVisualization(); // Asegúrate de actualizar la visualización después de modificar los datos
  }


  function updateVisualization() {
    for (let i = 0; i < graphData.nodes.length; i++) {
      graphData.nodes[i].id = i;
    }
    console.log(graphData.nodes);
    // Actualizar enlaces existentes
    console.log(graphData.links);
    links = linkGroup.selectAll("line")
      .data(graphData.links);

    links.exit().remove(); // Eliminar enlaces no utilizados

    links = links.enter().append("line")
      .attr("class", "link")
      .attr("style", link_attr)
      .attr("stroke", "#444")
      .attr("stroke-width", 8)
      .merge(links); // Combinar enlaces existentes y nuevos

    // Actualizar nodos existentes
    nodes = nodeGroup.selectAll("circle")
      .data(graphData.nodes);

    nodes.exit().remove(); // Eliminar nodos no utilizados

    nodes = nodes.enter().append("circle")
      .attr("r", 20)
      .attr("class", "graph-node")
      .attr("style", node_attr)
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragEnded))
      // .on("click", nodeClicked)
      // .on("contextmenu", nodeContextMenu) // Agregar menú contextual
      .merge(nodes); // Combinar nodos existentes y nuevos

    // Actualizar etiquetas de nodos existentes
    nodeLabels = svg.selectAll(".node-label")
      .data(graphData.nodes, d => `${d.id}: ${d.name}`);

    nodeLabels.exit().remove(); // Eliminar etiquetas no utilizadas

    nodeLabels = nodeLabels.enter().append("text")
      .attr("class", "node-label invisible")
      .attr("style", nodeLabel_attr)
      .merge(nodeLabels) // Combinar etiquetas de nodos existentes y nuevas
      .text(d => `${d.id}: ${d.name}`);

    // Actualizar la simulación con los datos actualizados
    info();

    simulation.nodes(graphData.nodes);
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }

  function info() {
    // nodeLabels
    //   .on("mouseover", (event, d) => {
    //     // Muestra la información del nodo cuando el mouse está sobre él
    //     const tooltip = d3.select("#tooltip");
    //     tooltip.transition().duration(200).style("opacity", .9);
    //     tooltip.html(
    //       `Nombre: ${d.name}
    //       Duración: ${d.duration}
    //       Costo: ${d.cost}
    //       Prerequisito: ${d.prerequisites}
    //       ${d.postrequisites.length > 0 ? "Postrequisito: " + d.postrequisites : ""}`)

    //       .style("left", (event.pageX) + "px")
    //       .style("top", (event.pageY - 28) + "px");
    //   })
    //   .on("mouseout", function (d) {
    //     // Oculta la información cuando el mouse sale del nodo
    //     const tooltip = d3.select("#tooltip");
    //     tooltip.transition().duration(500).style("opacity", 0);
    //   })

    // Muestra la información del nodo cuando el mouse está sobre él
    nodes
      .on("mouseover", (event, d) => {
        // Muestra la información del nodo cuando el mouse está sobre él
        nombre_input.setAttribute("value", d.name);
        duracion_input.setAttribute("value", d.duration);
        costo_input.setAttribute("value", d.cost);
        prerequisito_input.setAttribute("value", d.prerequisites);
        postrequisito_input.setAttribute("value", d.postrequisites);
      })
      .on("mouseout", (d) => {
        // Oculta la información cuando el mouse sale del nodo
        nombre_input.setAttribute("value", "");
        duracion_input.setAttribute("value", "");
        costo_input.setAttribute("value", "");
        prerequisito_input.setAttribute("value", "");
        postrequisito_input.setAttribute("value", "");
      })

    // Muestra la información del link cuando el mouse está sobre él
    links
      .on("mouseover", (event, d) => {
        tiempoLink_input.setAttribute("value", d.source.duration);
        nodoInicio_input.setAttribute("value", d.source.id);
        nodoFin_input.setAttribute("value", d.target.id);
      })
      .on("mouseout", (d) => {
        tiempoLink_input.setAttribute("value", "");
        nodoInicio_input.setAttribute("value", "");
        nodoFin_input.setAttribute("value", "");
      })
  }

  // funcion para descargar el grafo actual
  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", downloadGraph);

  function downloadGraph() {
    let atributosNodoPermitidos = ["id", "name", "duration", "cost", "prerequisites", "postrequisites"];
    let atributosLinkPermitidos = ["source", "target"];
    let nodes = [];
    let links = [];

    graphData.nodes.forEach(element => {
      let node = {};
      Object.keys(element).forEach(function (key) {
        if (atributosNodoPermitidos.includes(key)) {
          node[key] = element[key];
        }
      });
      nodes.push(node)
    });

    graphData.links.forEach(element => {
      let link = {};
      Object.keys(element).forEach(function (key) {
        if (atributosLinkPermitidos.includes(key)) {
          link[key] = element[key].id
        }
      });
      links.push(link)
    });

    let downloadGrafo = {
      nodes: nodes,
      links: links,
    };


    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadGrafo));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "graph.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const fileInput = document.getElementById("cargarBtn");
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      graphData = JSON.parse(event.target.result);
      updateVisualization();
    };
    reader.readAsText(file);
  });

  // Funcion para matriz de adyacencia
  const matrizButton = document.getElementById("matriz-button");
  matrizButton.addEventListener("click", matrizAdyacencia);

  function matrizAdyacencia() {

    let nodes = simulation.nodes();
    let links = simulation.force("link").links();

    const numNodes = nodes.length;

    let matriz = new Array(numNodes).fill(null).map(() => new Array(numNodes).fill(0));

    links.forEach(link => {
      let source = link.source.index;
      let target = link.target.index;
      matriz[source][target] = 1;
    });

    console.log("Matriz de adyacencia", matriz);
  }

  // Funcion para matriz de incidencia
  const incidenciaButton = document.getElementById("incidencia-button");
  incidenciaButton.addEventListener("click", matrizIncidencia);

  function matrizIncidencia() {

    let nodes = simulation.nodes();
    let links = simulation.force("link").links();

    const numNodes = nodes.length;
    const numLinks = links.length;

    let matriz = new Array(numNodes).fill(null).map(() => new Array(numLinks).fill(0));

    links.forEach((link, index) => {
      let source = link.source.index;
      let target = link.target.index;
      matriz[source][index] = 1;
      matriz[target][index] = -1;
    });

    console.log("Matriz de incidencia", matriz);
  }

    const dijkstraButton = document.getElementById("dijkstra-button");
  dijkstraButton.addEventListener("click", dijkstra);

  function dijkstra() {
    let nodes = simulation.nodes();
    let links = simulation.force("link").links();

    const numNodes = nodes.length;
    const numLinks = links.length;

    let matriz = new Array(numNodes).fill(null).map(() => new Array(numNodes).fill(0));

    links.forEach(link => {
      let source = link.source.index;
      let target = link.target.index;
      matriz[source][target] = 1;
    });

    console.log(matriz);

    let nodoInicial = parseInt(prompt("Ingrese el nodo inicial:"));
    let nodoFinal = parseInt(prompt("Ingrese el nodo final:"));

    let distancias = new Array(numNodes).fill(Infinity);
    let visitados = new Array(numNodes).fill(false);

    distancias[nodoInicial] = 0;

    for (let i = 0; i < numNodes - 1; i++) {
      let min = Infinity;
      let minIndex = -1;

      for (let j = 0; j < numNodes; j++) {
        if (visitados[j] === false && distancias[j] <= min) {
          min = distancias[j];
          minIndex = j;
        }
      }

      let u = minIndex;

      visitados[u] = true;

      for (let v = 0; v < numNodes; v++) {
        if (visitados[v] === false && matriz[u][v] !== 0 && distancias[u] !== Infinity && distancias[u] + matriz[u][v] < distancias[v]) {
          distancias[v] = distancias[u] + matriz[u][v];
        }
      }
    }

    console.log(distancias);
    console.log(distancias[nodoFinal]);
  }

});
