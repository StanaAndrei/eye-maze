export default class Queue {
    #items = []
    enqueue = item => this.#items.splice(0, 0, item)
    dequeue = () => this.#items.pop()
    isempty = () => this.#items.length === 0
    empty = () => (this.#items.length = 0)
    size = () => this.#items.length
}