(define-constant ERR-NOT-COLLABORATOR u100)
(define-constant ERR-INVALID-SHARE u101)
(define-constant ERR-NO-SHARES-CONFIGURED u102)
(define-constant ERR-NOTHING-TO-CLAIM u103)
(define-constant ERR-NON-POSITIVE-AMOUNT u104)

(define-data-var total-shares uint u0)
(define-data-var total-deposited uint u0)

(define-map collaborators
  { who: principal }
  { share: uint, claimed: uint })

(define-read-only (get-total-shares)
  (var-get total-shares))

(define-read-only (get-total-deposited)
  (var-get total-deposited))

(define-read-only (get-collaborator (who principal))
  (match (map-get? collaborators { who: who })
    coll coll
    { share: u0, claimed: u0 }))

(define-read-only (get-claimable (who principal))
  (let (
        (maybe-coll (map-get? collaborators { who: who }))
       )
    (match maybe-coll
      coll
        (let (
              (total-shares (var-get total-shares))
              (total-deposited (var-get total-deposited))
              (share (get share coll))
              (claimed (get claimed coll))
             )
          (if (is-eq total-shares u0)
              u0
              (let (
                    (entitled (/ (* total-deposited share) total-shares))
                    (unclaimed (if (> entitled claimed) (- entitled claimed) u0))
                   )
                unclaimed)))
      u0)))

(define-public (set-collaborator-share (who principal) (share uint))
  (begin
    (asserts! (> share u0) (err ERR-INVALID-SHARE))
    (let (
          (existing (map-get? collaborators { who: who }))
         )
      (match existing
        coll
          (let (
                (old-share (get share coll))
               )
            (var-set total-shares (+ (- (var-get total-shares) old-share) share))
            (map-set collaborators { who: who } { share: share, claimed: (get claimed coll) }))
        (begin
          (var-set total-shares (+ (var-get total-shares) share))
          (map-insert collaborators { who: who } { share: share, claimed: u0 }))))
    (ok share)))

(define-public (deposit-liquidity (amount uint))
  (begin
    (asserts! (> amount u0) (err ERR-NON-POSITIVE-AMOUNT))
    (asserts! (> (var-get total-shares) u0) (err ERR-NO-SHARES-CONFIGURED))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set total-deposited (+ (var-get total-deposited) amount))
    (ok amount)))

(define-public (claim)
  (let (
        (maybe-collaborator (map-get? collaborators { who: tx-sender }))
       )
    (match maybe-collaborator
      coll
        (let (
              (claimable (get-claimable tx-sender))
             )
          (if (is-eq claimable u0)
              (err ERR-NOTHING-TO-CLAIM)
              (begin
                ;; pay from contract to caller
                (try! (as-contract (stx-transfer? claimable tx-sender tx-sender)))
                (map-set collaborators
                         { who: tx-sender }
                         { share: (get share coll),
                           claimed: (+ (get claimed coll) claimable) })
                (ok claimable))))
      (err ERR-NOT-COLLABORATOR))))
