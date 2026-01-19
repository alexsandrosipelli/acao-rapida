import { initState } from './state.js'
import { render } from './ui/render.js'
import { bindInteractions } from './ui/interactions.js'


initState()
render()
bindInteractions()


if('serviceWorker' in navigator){
navigator.serviceWorker.register('./service-worker.js')
}