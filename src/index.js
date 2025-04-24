const LINE_COLOR = "#cdcdcd"
const DIAG_SCALE = 20
const LINE_WIDTH = DIAG_SCALE * 0.3
const LAMBDA_OFFSET = DIAG_SCALE * 0.2

function render() {
    const canvas = document.getElementById("diagram")
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = LINE_COLOR
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const expression = document.getElementById("expression").value
    lambda_expr = parse(expression)
    if (lambda_expr == null){
        ctx.fillStyle = "#808080A0"
        ctx.font = "bold 16px sans-serif"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText("Empty expression !", (canvas.width / 2), (canvas.height / 2))
    }
    console.log(lambda_expr.to_string())


    const tree = new LambdaTree(lambda_expr)
    let it = tree.root
    console.log(it.to_string())

    let variable_cpt = 0
    let lambda_cpt = 0
    let lambda_vars = []
    let step_ends = new Map()
    let step_heights = new Map()
    let step_known_lambdas = new Map()
    let altitude = it.depth()
    while (it != null) {
        // console.log(lambda_cpt)
        // console.log(class_of(it))
        switch (class_of(it)) {
            case "Variable":
                let lambda_nb = lambda_vars.indexOf(it.value)
                // console.log("Altitude for : " + it.to_string() + " : " + altitude)
                console.log(lambda_nb)
                if (lambda_nb == -1) lambda_nb = lambda_vars.length
                const height = DIAG_SCALE + lambda_nb * DIAG_SCALE
                console.log(height)
                const fsp = it.first_step_parent()
                let parent_x = step_heights.get(fsp)
                if (parent_x == null) parent_x = DIAG_SCALE * (altitude + lambda_cpt + 1)
                if (parent_x == height) parent_x += DIAG_SCALE
                ctx.fillRect(DIAG_SCALE + 2 * DIAG_SCALE * variable_cpt, height, LINE_WIDTH, parent_x - height)
                // ctx.fillRect(DIAG_SCALE + 2 * DIAG_SCALE * variable_cpt, height, LINE_WIDTH, DIAG_SCALE * (altitude + lambda_cpt - lambda_nb + first_offset))
                variable_cpt++
                break
        
            case "Lambda":
                // console.log("Size : " + it.size())
                const fspfwtisc = it.first_step_parent_from_which_this_is_second_child()
                let start_x = step_ends.get(fspfwtisc)
                if (start_x == null) {
                    start_x = DIAG_SCALE
                } else {
                    start_x -= LINE_WIDTH
                }
                ctx.fillRect(start_x - LAMBDA_OFFSET, DIAG_SCALE + lambda_cpt * DIAG_SCALE, 2 * DIAG_SCALE * (it.size() - 1) + LINE_WIDTH + (LAMBDA_OFFSET * 2), LINE_WIDTH)
                lambda_vars.push(it.variable)
                lambda_cpt++
                break
            
            case "Step":
                const step_x = DIAG_SCALE + 2 * DIAG_SCALE * variable_cpt
                const step_y = DIAG_SCALE * (altitude + lambda_cpt)
                const step_Dx = 2 * DIAG_SCALE * (it.content[0].size()) + LINE_WIDTH
                ctx.fillRect(step_x, step_y, step_Dx, LINE_WIDTH)
                step_ends.set(it, step_x + step_Dx)
                step_heights.set(it, step_y)
                step_known_lambdas.set(it, lambda_cpt)
                ldepth = it.content[0].depth()
                rdepth = it.content[1].depth()
                ctx.fillRect(DIAG_SCALE + 2 * DIAG_SCALE * variable_cpt, step_y, LINE_WIDTH, DIAG_SCALE)
                break
        }
        const res = it.next()
        it = res[0]
        altitude -= res[1]
        if (it != null && res[1] < 0) lambda_cpt = step_known_lambdas.get(it.parent)
    }
}
