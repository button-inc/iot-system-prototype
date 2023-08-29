<script setup lang="ts">
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import L from 'leaflet';
// import { IRouter, IGeocoder, LineOptions } from "leaflet-routing-machine";
import { onMounted, ref, watch } from 'vue'

const props = {
  mapObject: {
    type: Object
  },
  visible: {
    type: Boolean,
    default: true
  },
  waypoints: {
    type: Array,
    required: true
  },
  // router: {
  //   type: IRouter,
  // },
  plan: {
    type: L.Routing.Plan
  },
  // geocoder: {
  //   type: IGeocoder,
  // },
  fitSelectedRoutes: {
    type: [String, Boolean],
    default: 'smart'
  },
  // lineOptions: {
  //   type: LineOptions,
  // },
  routeLine: {
    type: Function
  },
  autoRoute: {
    type: Boolean,
    default: true
  },
  routeWhileDragging: {
    type: Boolean,
    default: false
  },
  routeDragInterval: {
    type: Number,
    default: 500
  },
  waypointMode: {
    type: String,
    default: 'connect'
  },
  useZoomParameter: {
    type: Boolean,
    default: false
  },
  showAlternatives: {
    type: Boolean,
    default: false
  }
  // altLineOptions: {
  //   type: LineOptions,
  // },
}

let ready = ref(false)
let map = ref(null)
let layer = ref(null)

watch(
  () => props.mapObject,
  (first, second) => {
    if (second == null) {
      return
    }
    add()
  }
)

function add() {
  if (props.mapObject == null) {
    return
  }

  const {
    waypoints,
    fitSelectedRoutes,
    autoRoute,
    routeWhileDragging,
    routeDragInterval,
    waypointMode,
    useZoomParameter,
    showAlternatives
  } = props

  const options = {
    waypoints,
    fitSelectedRoutes,
    autoRoute,
    routeWhileDragging,
    routeDragInterval,
    waypointMode,
    useZoomParameter,
    showAlternatives
  }

  const routingLayer = L.Routing.control(options)
  routingLayer.addTo(props.mapObject)
  layer.value = routingLayer

  ready.value = true
}

onMounted(() => {
  add()
})
</script>
