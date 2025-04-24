/*
Examples:
2:  - Lfx(f,(x,f))
    - LfLx(f, (x, f))
    - λf.λx.(f,(x,f))

True:  λxy.x
False: λxy.y
*/

function LAMBDA_PARAMETER_ERROR(place, faulty_char) {
    let error_end = ""
    if (faulty_char == 'L' || faulty_char == 'l') {
        error_end = `Can't put "${faulty_char}" as a lambda parameter.`
    } else {
        error_end = `Invalid lambda parameter. Expected value between a-z or A-Z, got "${faulty_char}".`
    }
    return `Parsing error occured at index ${place}. ${error_end}`
}
function EMPTY_LAMBDA(place) {
    return `Missing lambda body at index ${place}.`
}
function UNEXPECTED_CHARACTER(place, faulty_char) {
    return `Unexpected character at index ${place}: "${faulty_char}".`
}
function MISSING_ARGUMENT() {
    return `One or more node(s) did not manage to close.`
}

function unwrap_tab(tab) {
    if (class_of(tab) == "String") return tab
    let res = "["
    for (let i = 0; i < tab.length; i++) {
        res += unwrap_tab(tab[i]) + ","
    }
    res += "]"
    return res
}
function print_tab(tab){
    console.log(unwrap_tab(tab))
}

function build(node_stack){
    if (node_stack.length < 2) return null
    switch (node_stack[0]) {
        case 'v':
            return new Variable(node_stack[1])

        case 'l':
            return new Lambda(node_stack[1],build(node_stack[2]))

        case 's':
            return new Step([build(node_stack[1]),build(node_stack[2])])
    
        default:
            throw new Error("Something went wrong...")
    }
}

function parse(expression) {
    let node_stack = []
    let it = 0
    console.log("LENGTH: " + expression.length)
    while (it < expression.length) {
        //print_tab(node_stack)
        switch (expression.substr(it,1)) {
            case 'L':
            case 'λ':
                it++
                old_queue_length = node_stack.length
                let next = expression.substr(it,1)
                while (next.match(/[a-z]/i) && next != 'L' && next != 'l') {
                    node_stack.push(['l',next])
                    it++
                    next = expression.substr(it,1)
                }
                if (node_stack.length == old_queue_length) {
                    console.error(LAMBDA_PARAMETER_ERROR(it,next))
                    throw new Error("Lambda Parameter Error")
                }
                break

            case '(':
                node_stack.push(['s'])
                it++
                break

            case ')':
                it++
                if (node_stack.length >= 1 && node_stack.at(-2)[0] == 'l') { // Empty Lambda
                    console.error(EMPTY_LAMBDA(it-1))
                    throw new Error("Empty Lambda Error")
                    break
                } else {
                    if (node_stack.length >= 1 && node_stack.at(-2)[0] == 's' && node_stack.at(-2).length == 2) { // Step closing
                        node_stack.at(-2).push(node_stack.pop())
                        break
                    } else {
                        if (node_stack.at(-2)[0] == 's' && node_stack.at(-3)[0] == 'l') { // Lambda with parenthesis (parenthesis are considered a step here)
                            node_stack.at(-3).push(node_stack.pop())
                            node_stack.pop()
                            break
                        }
                    }
                }
                it--
                console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                throw new Error("Unexpected Character Error")

            case '.':
                if (node_stack.length > 0 && node_stack.at(-1)[0] == 'l') {
                    it++
                } else {
                    console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                    throw new Error("Unexpected Character Error")
                }
                break
            
            case ',':
                if (node_stack.length >= 2 && node_stack.at(-2)[0] == 's') {
                    node_stack.at(-2).push(node_stack.pop())
                    it++
                } else {
                    console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                    throw new Error("Unexpected Character Error")
                }
                break
            
            case ' ':
                it++
                break

            default:
                c = expression.substr(it,1)
                if (c.match(/[a-z]/i)) {
                    node_stack.push(['v',c])
                    it++
                }
                let check = it
                while (expression.substr(check,1) == ' ') {
                    check++
                }
                if (check < expression.length && expression.substr(check,1) != ',' && expression.substr(check,1) != ')') {
                    console.error(UNEXPECTED_CHARACTER(check,expression.substr(check,1)))
                    throw new Error("Unexpected Character Error")
                }
        }
    }
    while (node_stack.length > 1){
        if (node_stack.at(-2)[0] == 'l' || (node_stack.at(-2)[0] == 's' && node_stack.at(-2).length > 1)){
            node_stack.at(-2).push(node_stack.pop())
        } else {
            if (node_stack.at(-2)[0] == 's' && node_stack.at(-3)[0] == 'l') {
                node_stack.at(-3).push(node_stack.pop())
                node_stack.pop()
            } else {
                console.error(MISSING_ARGUMENT())
                throw new Error("Missing argument")
            }
        }
    }
    
    print_tab(node_stack)

    if (node_stack.length == 1) return build(node_stack[0])
    else return null
}
