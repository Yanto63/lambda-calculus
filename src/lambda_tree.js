class LambdaTree {
    constructor(root) {
        this.root = root
    }

    create2() {
        let n1 = new Variable('f')
        let n2 = new Variable('x')
        let n3 = new Variable('f')
        let n4 = new Step([n1, n2])
        n1.parent = n4
        n2.parent = n4
        let n5 = new Step([n3, n4])
        n3.parent = n5
        n4.parent = n5
        let n6 = new Lambda('x', n5)
        n5.parent = n6
        let n7 = new Lambda('f', n6)
        n6.parent = n7
        this.root = n7
        console.log(this.root.to_string())
    }

    createTrue() {
        let n1 = new Variable('x')
        let n2 = new Lambda('y', n1)
        n1.parent = n2
        let n3 = new Lambda('x', n2)
        n2.parent = n3
        this.root = n3
        console.log(this.root.to_string())
    }

    createCustom() {
        let v1 = new Variable('f')
        let v2 = new Variable('x')
        let v3 = new Variable('f')
        let s1 = new Step([v1, v2])
        v1.parent = s1
        v2.parent = s1
        let s2 = new Step([v3, s1])
        v3.parent = s2
        s1.parent = s2
        let l1 = new Lambda('x', s2)
        s2.parent = l1
        let v4 = new Variable('f')
        let l2 = new Lambda('f', v4)
        v4.parent = l2
        let s3 = new Step([l1, l2])
        l1.parent = s3
        l2.parent = s3
        let l3 = new Lambda('f', s3)
        s3.parent = l3
        this.root = l3
        console.log(this.root.to_string())
    }
}

class Node { }

class Variable extends Node {
    /**
     * 
     * @param {string} value 
     */
    constructor(value) {
        super()
        this.value = value
    }

    depth(){
        return this.__depth([])
    }
    __depth(known_lambdas) {
        if (!(this.value in known_lambdas)) return 1
        return 0
    }

    first_step_parent() {
        let parent = this.parent
        while (class_of(parent) === "Lambda") {
            parent = parent.parent
        }
        return parent
    }

    next() {
        let parent = this.parent
        let child = this
        // console.log(parent.to_string())
        let delta = -1
        while (class_of(parent) === "Lambda" || (class_of(parent) === "Step" && parent.content[1] == child)) {
            child = parent
            parent = parent.parent
            delta--
            // console.log(parent.to_string())
        }
        if (class_of(parent) === "Step") {
            if (parent.content[0] == child) {
                return [parent.content[1], delta + 1]
            }
        }
        return [null, delta]
    }

    size() {
        return 1
    }

    copy() {
        return new Variable(this.value)
    }

    to_string() {
        return this.value
    }
}

class Lambda extends Node {
    /**
     * 
     * @param {string} variable 
     * @param {Node} content 
     */
    constructor(variable, content) {
        super()
        this.variable = variable
        this.content = content
        this.content.parent = this
    }

    depth(){
        return this.__depth([])
    }
    __depth(known_lambdas) {
        known_lambdas.push(this.variable)
        return this.content.__depth(known_lambdas) + 1
    }

    first_step_parent_from_which_this_is_second_child() {
        let parent = this.parent
        let child = this
        while (class_of(parent) === "Lambda" || (class_of(parent) === "Step" && parent.content[1] != child)) {
            child = parent
            parent = parent.parent
        }
        return parent
    }

    next() {
        return [this.content, 1]
    }

    size() {
        return this.content.size()
    }

    copy() {
        return new Lambda(this.variable, this.content.copy())
    }

    to_string() {
        return "(λ" + this.variable + ":" + this.content.to_string() + ")"
    }
}

class Step extends Node {
    /**
     * 
     * @param {Node[]} content 
     */
    constructor(content) {
        super()
        this.content = content
        this.content[0].parent = this
        this.content[1].parent = this
    }

    depth(){
        return this.__depth([])
    }
    __depth(known_lambdas) {
        const ldepth = this.content[0].__depth(known_lambdas)
        const rdepth = this.content[1].__depth(known_lambdas)
        return (ldepth > rdepth ? ldepth : rdepth) + 1
    }

    next() {
        return [this.content[0], 1]
    }

    size() {
        return this.content[0].size() + this.content[1].size()
    }

    copy() {
        return new Step([this.content[0].copy(), this.content[1].copy()])
    }

    to_string() {
        return "(" + this.content[0].to_string() + "," + this.content[1].to_string() + ")"
    }
}
