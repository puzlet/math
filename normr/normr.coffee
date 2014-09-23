$blab.normr = (A) ->
    
    norm = (U) -> (sqrt(row.sum()) for row in U)

    cplx = A instanceof nm.T

    B = if cplx then A else complex A, A*0 
    N = nm.diag(1/norm((B*B.conj()).x))
    C = complex(N, N*0).dot(B)

    if cplx then C else C.x        
