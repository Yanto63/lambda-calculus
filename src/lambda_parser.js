/*
Examples:
2:  - Lfx(f,(x,f))
    - LfLx(f, (x, f))
    - λf.λl.(f,(x,f))

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
function UNEXPECTED_CHARACTER(place, faulty_char) {
    return `Unexpected character at index ${place}: "${faulty_char}".`
}

function unwrap_tab(tab) {
    if (class_of(tab) == "String") return tab
    let res = "["
    for (i = 0; i < tab.length; i++) {
        res += unwrap_tab(tab[i]) + ","
    };
    res += "]"
    return res
}
function print_tab(tab){
    console.log(unwrap_tab(tab))
}

function parse(expression) { // FIXME: Lx(x) ends up with just [[l,x]] and fails at ")"
    let node_queue = []
    let it = 0
    console.log("LENGTH: " + expression.length)
    while (it < expression.length) {
        console.log("Hello")
        switch (expression.substr(it,1)) {
            case 'L' || 'λ':
                it++
                old_queue_length = node_queue.length
                let next = expression.substr(it,1)
                while (next.match(/[a-z]/i) && next != 'L') {
                    node_queue.push(['l',next])
                    it++
                    next = expression.substr(it,1)
                }
                if (node_queue.length == old_queue_length) {
                    console.error(LAMBDA_PARAMETER_ERROR(it,next))
                    throw new Error("Lambda Parameter Error");
                }
                print_tab(node_queue)
                break;

            case '(':
                node_queue.push(['s'])
                it++
                print_tab(node_queue)
                break;

            case ')':
                if (node_queue[-2][0] == 'l') {
                    node_queue[-2].push(node_queue.pop())
                } else {
                    if (node_queue[-3][0] == 's') {
                        const second_arg = node_queue.pop()
                        node_queue[-2].push(node_queue.pop())
                        node_queue[-1].push(second_arg)
                    } else {
                        console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                        throw new Error("Unexpected Character Error");
                    }
                    console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                    throw new Error("Unexpected Character Error");
                }
                it++
                print_tab(node_queue)
                break;

            case '.':
                if (node_queue.length > 0 && node_queue[-1][0] == 'l') {
                    it++
                } else {
                    console.error(UNEXPECTED_CHARACTER(it,expression.substr(it,1)))
                    throw new Error("Unexpected Character Error");
                }
                break;
            
            case ' ':
                it++
                break;

            default:
                c = expression.substr(it,1)
                if (c.match(/[a-z]/i)) {
                    node_queue.push(['v',c])
                    it++
                    let check = it
                    while (expression.substr(check,1) == ' ') {
                        check++
                    }
                    if (check < expression.length && expression.substr(check,1) != ',' && expression.substr(check,1) != ')') {
                        console.error(UNEXPECTED_CHARACTER(check,expression.substr(check,1)))
                        throw new Error("Unexpected Character Error");
                    }
                } else {
                    console.error(UNEXPECTED_CHARACTER(check,expression.substr(check,1)))
                    throw new Error("Unexpected Character Error");
                }
                print_tab(node_queue)
                break;
        }
    }
    print_tab(node_queue)
}