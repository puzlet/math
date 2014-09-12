$blab.normr = (A) ->
    norm = (U) -> (sqrt(row.sum()) for row in U)
    N = nm.diag(1/norm((A*A.conj()).x))
    complex(N, N*0).dot(A)
