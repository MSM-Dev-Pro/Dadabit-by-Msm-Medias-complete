/**
 * ========================================
 * EXTENSION MSM HELPER COMPLÈTE v2.1
 * ========================================
 * 
 * Cette extension contient :
 * 1. MSM Helper - Blocs simplifiés pour Dadabit
 * 2. Dadabit - Chargé comme dépendance (inclut WonderCam)
 * 
 * Auteur: MSM MEDIAS
 * Version: 2.1.0
 * License: MIT
 * 
 * Note: Dadabit est chargé via pxt.json dependencies
 *       WonderCam est automatiquement inclus via Dadabit
 */

/**
 * Extension Dadabit Helper par MSM MEDIAS
 * Simplifie navigation, mouvements et actions Dadabit
 * Version 1.1.2 - FIXED
 */

//% color=#FF6B35 weight=100 icon="\uf085" block="MSM Helper"
//% groups=['Navigation', 'Mouvement', 'Capteurs', 'Actions', 'Utils']
namespace msmHelper {

    // ==================== VARIABLES INTERNES ====================
    
    let S0 = false
    let S1 = false
    let S2 = false
    let S3 = false
    let lastDir = 1
    let barLatched = false
    let barHighMs = 0
    let cooldownUntil = 0
    let barArmed = true

    // Constantes de vitesse
    const V_FAST = 70
    const V_MED = 42
    const V_SLOW = 32
    const V_TURN = 100
    
    // Constantes de detection
    const LOOP_MS = 20
    const BAR_HOLD_MS = 30
    const BAR_COOLDOWN_MS = 220

    // ==================== FONCTIONS INTERNES ====================
    
    function readAllSensors() {
        S0 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        S1 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        S2 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        S3 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    function countBlackSensors(): number {
        let count = 0
        if (S0) count++
        if (S1) count++
        if (S2) count++
        if (S3) count++
        return count
    }

    function allWhite(): boolean {
        return !S0 && !S1 && !S2 && !S3
    }

    function allBlack(): boolean {
        return S0 && S1 && S2 && S3
    }

    function ambiguous(): boolean {
        return (S0 && S2 && S3 && !S1) ||
               (S0 && S1 && S3 && !S2) ||
               (S1 && S2 && S3 && !S0) ||
               (S0 && S1 && S2 && !S3)
    }

    function forward(speed: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, speed)
    }

    function backward(speed: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, speed)
    }

    function spinLeft(speed: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, speed)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, speed)
    }

    function spinRight(speed: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, speed)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, speed)
    }

    function slightLeft(speedFast: number, speedSlow: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, speedSlow)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, speedSlow)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, speedFast)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, speedFast)
    }

    function slightRight(speedFast: number, speedSlow: number) {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, speedFast)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, speedFast)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, speedSlow)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, speedSlow)
    }

    function stopAll() {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, 0)
    }

    function recoverySearch() {
        forward(V_SLOW)
        basic.pause(180)
        for (let i = 0; i < 18; i++) {
            readAllSensors()
            if (!allWhite()) return
            if (lastDir < 0) {
                spinLeft(V_MED)
            } else {
                spinRight(V_MED)
            }
            basic.pause(110)
        }
        lastDir = 0 - lastDir
    }

    // ==================== NAVIGATION ====================

    /**
     * Suit automatiquement une ligne noire
     * @param vitesse Vitesse de suivi (20-100), eg: 42
     */
    //% block="suivre ligne automatique vitesse %vitesse"
    //% vitesse.min=20 vitesse.max=100 vitesse.defl=42
    //% weight=100
    //% group="Navigation"
    export function suivreLigneAutomatique(vitesse: number = V_MED) {
        readAllSensors()

        if (ambiguous()) {
            forward(V_SLOW)
            basic.pause(140)
            return
        }

        if (allWhite()) {
            recoverySearch()
            return
        }

        if (S1 && S2) {
            forward(vitesse)
            return
        }

        if (S0 && S1 && !S2 && !S3) {
            lastDir = -1
            spinLeft(V_MED)
            return
        }

        if (S2 && S3 && !S0 && !S1) {
            lastDir = 1
            spinRight(V_MED)
            return
        }

        if (S1 && !S0 && !S2 && !S3) {
            lastDir = -1
            slightLeft(V_MED, V_SLOW)
            return
        }

        if (S2 && !S0 && !S1 && !S3) {
            lastDir = 1
            slightRight(V_MED, V_SLOW)
            return
        }

        if (S0 && !S1 && !S2 && !S3) {
            lastDir = -1
            spinLeft(V_FAST)
            return
        }

        if (S3 && !S0 && !S1 && !S2) {
            lastDir = 1
            spinRight(V_FAST)
            return
        }

        forward(V_SLOW)
    }

    /**
     * Detecte une barre transversale avec anti-rebond
     */
    //% block="sur barre transversale ?"
    //% weight=95
    //% group="Navigation"
    export function surBarreTransversale(): boolean {
        readAllSensors()

        if (countBlackSensors() <= 2) {
            barArmed = true
        }

        const now = control.millis()
        
        if (now < cooldownUntil) return false
        if (!barArmed) return false

        const high = countBlackSensors() >= 3

        if (high) {
            barHighMs += LOOP_MS
        } else {
            barHighMs = 0
        }

        if ((allBlack() || barHighMs >= BAR_HOLD_MS) && !barLatched) {
            barLatched = true
            cooldownUntil = now + BAR_COOLDOWN_MS
            barArmed = false
            return true
        }

        if (!high) {
            barLatched = false
        }

        return false
    }

    /**
     * Quitte proprement la barre actuelle
     */
    //% block="quitter barre actuelle"
    //% weight=90
    //% group="Navigation"
    export function quitterBarre() {
        forward(V_SLOW)
        basic.pause(350)
        stopAll()
        basic.pause(200)
        barLatched = false
        barHighMs = 0
        cooldownUntil = control.millis() + 500
        barArmed = false
    }

    /**
     * Recherche la ligne si perdue
     */
    //% block="recuperer ligne perdue"
    //% weight=85
    //% group="Navigation"
    export function recupererLigne() {
        recoverySearch()
    }

    // ==================== MOUVEMENT ====================

    /**
     * Tourne a gauche de 90 degres
     * @param dureeMs Duree du virage en ms, eg: 1200
     */
    //% block="tourner gauche 90° duree %dureeMs ms"
    //% dureeMs.min=800 dureeMs.max=2000 dureeMs.defl=1200
    //% weight=100
    //% group="Mouvement"
    export function tournerGauche90(dureeMs: number = 1200) {
        forward(V_SLOW)
        basic.pause(140)
        stopAll()
        basic.pause(50)
        spinLeft(V_TURN)
        basic.pause(dureeMs)
        stopAll()
    }

    /**
     * Tourne a droite de 90 degres
     * @param dureeMs Duree du virage en ms, eg: 1200
     */
    //% block="tourner droite 90° duree %dureeMs ms"
    //% dureeMs.min=800 dureeMs.max=2000 dureeMs.defl=1200
    //% weight=95
    //% group="Mouvement"
    export function tournerDroite90(dureeMs: number = 1200) {
        forward(V_SLOW)
        basic.pause(140)
        stopAll()
        basic.pause(50)
        spinRight(V_TURN)
        basic.pause(dureeMs)
        stopAll()
    }

    /**
     * Fait un demi-tour (180°)
     * @param dureeMs Duree du demi-tour en ms, eg: 2400
     */
    //% block="demi tour 180° duree %dureeMs ms"
    //% dureeMs.min=1600 dureeMs.max=4000 dureeMs.defl=2400
    //% weight=90
    //% group="Mouvement"
    export function demiTour(dureeMs: number = 2400) {
        spinLeft(V_TURN)
        basic.pause(dureeMs)
        stopAll()
    }

    /**
     * Avance pendant une duree
     * @param dureeMs Duree en ms, eg: 1000
     * @param vitesse Vitesse (20-100), eg: 42
     */
    //% block="avancer %dureeMs ms vitesse %vitesse"
    //% dureeMs.min=100 dureeMs.max=5000 dureeMs.defl=1000
    //% vitesse.min=20 vitesse.max=100 vitesse.defl=42
    //% weight=85
    //% group="Mouvement"
    export function avancerDuree(dureeMs: number = 1000, vitesse: number = V_MED) {
        forward(vitesse)
        basic.pause(dureeMs)
        stopAll()
    }

    /**
     * Recule pendant une duree
     * @param dureeMs Duree en ms, eg: 1000
     * @param vitesse Vitesse (20-100), eg: 32
     */
    //% block="reculer %dureeMs ms vitesse %vitesse"
    //% dureeMs.min=100 dureeMs.max=5000 dureeMs.defl=1000
    //% vitesse.min=20 vitesse.max=100 vitesse.defl=32
    //% weight=80
    //% group="Mouvement"
    export function reculerDuree(dureeMs: number = 1000, vitesse: number = V_SLOW) {
        backward(vitesse)
        basic.pause(dureeMs)
        stopAll()
    }

    /**
     * Arrete tous les moteurs
     */
    //% block="arreter tous moteurs"
    //% weight=75
    //% group="Mouvement"
    export function arreterMoteurs() {
        stopAll()
    }

    // ==================== CAPTEURS ====================

    /**
     * Compte le nombre de capteurs sur noir
     */
    //% block="nombre capteurs noirs"
    //% weight=100
    //% group="Capteurs"
    export function nombreCapteursNoirs(): number {
        readAllSensors()
        return countBlackSensors()
    }

    /**
     * Verifie si tous les capteurs sont sur blanc
     */
    //% block="tous capteurs sur blanc ?"
    //% weight=95
    //% group="Capteurs"
    export function tousCapteursBlancs(): boolean {
        readAllSensors()
        return allWhite()
    }

    /**
     * Verifie si tous les capteurs sont sur noir
     */
    //% block="tous capteurs sur noir ?"
    //% weight=90
    //% group="Capteurs"
    export function tousCapteursNoirs(): boolean {
        readAllSensors()
        return allBlack()
    }

    /**
     * Verifie si les capteurs centraux sont sur la ligne
     */
    //% block="capteurs centraux sur ligne ?"
    //% weight=85
    //% group="Capteurs"
    export function capteursCentrauxSurLigne(): boolean {
        readAllSensors()
        return S1 && S2
    }

    /**
     * Lit un capteur specifique
     * @param numero Numero du capteur (0-3), eg: 1
     */
    //% block="capteur %numero est noir ?"
    //% numero.min=0 numero.max=3 numero.defl=1
    //% weight=80
    //% group="Capteurs"
    export function capteurNoir(numero: number): boolean {
        readAllSensors()
        switch(numero) {
            case 0: return S0
            case 1: return S1
            case 2: return S2
            case 3: return S3
            default: return false
        }
    }

    // ==================== ACTIONS ====================

    /**
     * Depose un objet avec servo 270°
     * @param port Port du servo, eg: 6
     * @param angleDep Angle de depose, eg: -100
     * @param angleRep Angle de repos, eg: -20
     */
    //% block="deposer objet servo %port angle depose %angleDep repos %angleRep"
    //% port.min=1 port.max=6 port.defl=6
    //% angleDep.min=-135 angleDep.max=135 angleDep.defl=-100
    //% angleRep.min=-135 angleRep.max=135 angleRep.defl=-20
    //% weight=100
    //% group="Actions"
    export function deposerObjet(port: number = 6, angleDep: number = -100, angleRep: number = -20) {
        music.playTone(523, music.beat(BeatFraction.Quarter))
        basic.pause(150)
        dadabit.setLego270Servo(port, angleDep, 200)
        basic.pause(2000)
        dadabit.setLego270Servo(port, angleRep, 500)
        basic.pause(300)
    }

    /**
     * Saisit un objet avec servo 270°
     * @param port Port du servo, eg: 6
     * @param angleSais Angle de saisie, eg: -100
     * @param angleRep Angle de repos, eg: -20
     */
    //% block="saisir objet servo %port angle saisie %angleSais repos %angleRep"
    //% port.min=1 port.max=6 port.defl=6
    //% angleSais.min=-135 angleSais.max=135 angleSais.defl=-100
    //% angleRep.min=-135 angleRep.max=135 angleRep.defl=-20
    //% weight=95
    //% group="Actions"
    export function saisirObjet(port: number = 6, angleSais: number = -100, angleRep: number = -20) {
        dadabit.setLego270Servo(port, angleSais, 300)
        basic.pause(1000)
        dadabit.setLego270Servo(port, angleRep, 500)
        basic.pause(300)
        music.playTone(659, music.beat(BeatFraction.Quarter))
    }

    /**
     * Prepare le servo en position repos
     * @param port Port du servo, eg: 6
     * @param angle Angle de repos, eg: -20
     */
    //% block="preparer servo %port angle repos %angle"
    //% port.min=1 port.max=6 port.defl=6
    //% angle.min=-135 angle.max=135 angle.defl=-20
    //% weight=90
    //% group="Actions"
    export function preparerServo(port: number = 6, angle: number = -20) {
        dadabit.setLego270Servo(port, angle, 300)
    }

    /**
     * Sequence son + LED (feedback) - Version simplifiee sans RGB
     */
    //% block="feedback son LED"
    //% weight=85
    //% group="Actions"
    export function feedbackSonLED() {
        music.playTone(523, music.beat(BeatFraction.Eighth))
        basic.showIcon(IconNames.Yes)
        basic.pause(300)
        basic.clearScreen()
    }

    // ==================== UTILITAIRES ====================

    /**
     * Affiche un texte et l'efface apres un delai
     * @param texte Texte a afficher
     * @param dureeMs Duree d'affichage en ms, eg: 1000
     */
    //% block="afficher temporaire %texte pendant %dureeMs ms"
    //% dureeMs.min=100 dureeMs.max=5000 dureeMs.defl=1000
    //% weight=100
    //% group="Utils"
    export function afficherTemporaire(texte: string, dureeMs: number = 1000) {
        basic.clearScreen()
        basic.showString(texte)
        basic.pause(dureeMs)
        basic.clearScreen()
    }

    /**
     * Affiche un texte (reste affiche)
     * @param texte Texte a afficher
     */
    //% block="afficher %texte"
    //% weight=95
    //% group="Utils"
    export function afficher(texte: string) {
        basic.clearScreen()
        basic.showString(texte)
    }

    /**
     * Attend qu'une barre soit detectee
     */
    //% block="attendre barre detectee"
    //% weight=90
    //% group="Utils"
    export function attendreBarreDetectee() {
        while (!surBarreTransversale()) {
            basic.pause(20)
        }
    }

    /**
     * Initialise le robot pour projet transport
     */
    //% block="initialiser robot transport"
    //% weight=85
    //% group="Utils"
    export function initialiserRobotTransport() {
        dadabit.dadabit_init()
        serial.redirect(SerialPin.P12, SerialPin.P8, BaudRate.BaudRate115200)
        basic.pause(100)
        basic.clearScreen()
    }

    /**
     * Pause ajustable
     * @param dureeMs Duree en ms, eg: 1000
     */
    //% block="pause %dureeMs ms"
    //% dureeMs.min=10 dureeMs.max=10000 dureeMs.defl=1000
    //% weight=80
    //% group="Utils"
    export function pause(dureeMs: number = 1000) {
        basic.pause(dureeMs)
    }
}

// ==========================================
// NOTE: Dadabit et WonderCam sont chargés automatiquement
// via les dépendances dans pxt.json
// ==========================================
