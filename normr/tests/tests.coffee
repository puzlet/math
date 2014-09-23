test "complex input", (assert) -> 

    A = complex [[1, 3], [5, 7]], [[2, 4], [6, 8]]
    correct = complex [[0.182574185835055, 0.547722557505166], [0.379049021789452, 0.530668630505232]],
        [[0.365148371670111, 0.730296743340221], [0.454858826147342, 0.606478434863123]]

    assert.ok ($blab.normr(A)-correct).norm2() < nm.epsilon

test "real input", (assert) -> 

    A = [[0, 2], [3, 4]]
    correct = [[0, 1], [0.6, 0.8]]
    y = complex($blab.normr(A)-correct, A*0) # fudge for norm2
    assert.ok y.norm2() < nm.epsilon

