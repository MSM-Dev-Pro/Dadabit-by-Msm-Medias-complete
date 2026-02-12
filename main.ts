/**
 * ========================================
 * EXTENSION MSM HELPER ULTRA-COMPLÈTE v2.0
 * ========================================
 * 
 * Combine 3 extensions en une seule :
 * 1. MSM Helper - Blocs simplifiés (INTACTS)
 * 2. Dadabit - Extension officielle complète
 * 3. WonderCam - Module vision IA (dépendance externe)
 * 
 * Auteur: MSM MEDIAS
 * Version: 2.0.0
 * License: MIT
 */

// ==========================================
// 1. MSM HELPER (VOS BLOCS - SANS TOUCHER)
// ==========================================

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
// 2. DADABIT OFFICIEL (BLOCS COMPLETS)
// ==========================================

/*
 dadabit package
*/
//% weight=10 icon="\uf013" color=#ff7f00
namespace dadabit {
    export enum Lights {
        //% block="Light 1"
        Light1 = 0x0,
        //% block="Light 2"
        Light2 = 0x1,
        //% block="All"
        All = 0x2
    }

    export enum iicPort {
        //% block="4"
        port4 = 0x04,
        //% block="5"
        port5 = 0x05,
        //% block="6"
        port6 = 0x06
    }

    export enum ioPort1 {
        //% block="1"
        port1 = 0x01
    }

    export enum ioPort2 {
        //% block="2"
        port2 = 0x02
    }

    export enum Temp_humi {
        //% block="Temperature"
        Temperature = 0x01,
        //% block="Humidity"
        Humidity = 0x02
    }

    export enum Oriention {
        //% block="Clockwise"
        Clockwise = 0x01,
        //% block="Counterclockwise"
        Counterclockwise = 0x02
    }

    export enum LineFollowerSensors {
        //% block="S1"
        S1,
        //% block="S2"
        S2,
        //% block="S3"
        S3,
        //% block="S4"
        S4
    }

    export enum LineColor {
        //% block="Black"
        Black,
        //% block="White"
        White
    }

    let rgbLight: RGBLight.LHRGBLight;
    let boardRgbLight: RGBLight.LHRGBLight;

    let handleCmd: string = "";
    let batVoltage: number = 0;
    let distanceBak: number = 0;

    const INVALID_PORT = 0xff;
    let tempHumiPort = INVALID_PORT;
    let wifiPort = INVALID_PORT;
    let rgbPort = INVALID_PORT;
    let rainwaterPort = INVALID_PORT;

    let temperature: number = 0;
    let airhumidity: number = 0;

    function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    /**
     * DaDabit initialization, please execute at boot time
    */
    //% weight=100 blockId=dadabit_init block="Initialize DaDabit"
    //% subcategory=Init
    export function dadabit_init() {
        // initColorSensor();
        initBoardRGBLight();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);
        basic.forever(() => {
            getHandleCmd();
        });
    }

    function initBoardRGBLight() {
        if (!boardRgbLight) {
            boardRgbLight = RGBLight.create(DigitalPin.P15, 2, RGBPixelMode.RGB);
        }
        clearBoardLight();
    }


    /**
     * Temperature and humidity sensor initialization, please execute at boot time
    */
    //% weight=98 blockId=temphumidity_init block="Initialize temperature and humidity sensor at port %port"
    //% subcategory=Init
    export function temphumidity_init(port: iicPort) {
        tempHumiPort = port;
    }

    /**
     * Wifi module initialization, please execute at boot time
    */
    //% weight=96 blockId=wifi_init block="Initialize wifi module at port %port"
    //% subcategory=Init
    export function wifi_init(port: iicPort) {
        wifiPort = port;
    }

    /**
     * Rainwater sensor initialization, please execute at boot time
    */
    //% weight=94 blockId=rainwater_init block="Initialize rainwater sensor at port %port"
    //% subcategory=Init
    export function rainwater_init(port: ioPort1) {
        rainwaterPort = port;
    }

    /**
     * RGB module initialization, please execute at boot time
    */
    //% weight=92 blockId=rgb_init block="Initialize RGB module at port %port"
    //% subcategory=Init
    export function rgb_init(port: ioPort2) {
        rgbPort = port;
        initRGBLight();
    }

    /**
     * RGB module initialization, please execute at boot time
    */
    //% weight=90 blockId=linefollower_init block="Initialize linefollower sensor at port %port"
    //% subcategory=Init
    export function linefollower_init(port: iicPort) {

    }

    /**
     * Ultrasonic initialization, please execute at boot time
    */
    //% weight=88 blockId=ultrasonic_init block="Initialize ultrasonic sensor %port"
    //% subcategory=Init
    export function ultrasonic_init(port: iicPort) {

    }

    /**
     * Color recognition sensor initialization, please execute at boot time
    */
    //% weight=86 blockId=color_sensor_init block="Initialize color recognition sensor %port"
    //% subcategory=Init
    export function color_sensor_init(port: iicPort) {
        InitColor();
        enableLightSensor(true);
        control.waitMicros(100);
    }

    /**
    * Get the handle command.
    */
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
        if (index != -1) {
            let cmd: string = handleCmd.substr(0, index);
            if (cmd.charAt(0).compare("A") == 0 && cmd.length == 5) {
                let arg1Int: number = strToNumber(cmd.substr(1, 2));//P14 AD
                let arg2Int: number = strToNumber(cmd.substr(3, 2));//音量值
                let arg3Int: number = strToNumber(cmd.substr(5, 2));//电压值=值 * 25.78(mV)
                batVoltage = Math.round(arg3Int * 25.78);
            }
        }
        handleCmd = "";
    }

    function countChar(src: string, strFind: string): number {
        let cnt: number = 0;
        for (let i = 0; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                cnt++;
            }
        }
        return cnt;
    }

    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }

    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    /**
    * Set the angle of lego 270° servo 1 to 6, range of -135~135 degree
    * @param index servo number in 1-6. eg: 1
    */
    //% weight=81 blockId=setLego270Servo block="Set Lego 270° servo|index %index|angle %angle|duration %duration"
    //% angle.min=-135 angle.max=135
    //% subcategory=Control
    export function setLego270Servo(index: number, angle: number, duration: number) {
        angle += 135;
        if (angle > 270) {
            return;
        }

        let position = mapRGB(angle, 0, 270, 500, 2500);

        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }

    /**
    * Set the speed of lego 360° servo 1 to 6, range of 0~100
    * @param index servo number in 1-6. eg: 1
    */
    //% weight=80 blockId=setLego360Servo block="Set Lego 360° servo|index %index|oriention %oriention|speed %speed"
    //% speed.min=0 speed.max=100
    //% subcategory=Control
    export function setLego360Servo(index: number, oriention: Oriention, speed: number) {
        if (oriention == Oriention.Clockwise) {
            speed *= -1;
        }
        let position = mapRGB(speed, -100, 100, 500, 2500);
        let duration = 20;
        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }


    let ATH10_I2C_ADDR = 0x38;
    function temp_i2cwrite(value: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = value >> 8;
        buf[1] = value & 0xff;
        buf[2] = 0;
        basic.pause(80);
        let rvalue = pins.i2cWriteBuffer(ATH10_I2C_ADDR, buf);
        // serial.writeString("writeback:");
        // serial.writeNumber(rvalue);
        // serial.writeLine("");
        return rvalue;
    }

    function temp_i2cread(bytes: number): Buffer {
        let val = pins.i2cReadBuffer(ATH10_I2C_ADDR, bytes);
        return val;
    }

    function GetInitStatus(): boolean {
        temp_i2cwrite(0xe108);
        let value = temp_i2cread(1);
        if ((value[0] & 0x68) == 0x08)
            return true;
        else
            return false;
    }

    function getAc() {
        temp_i2cwrite(0xac33);
        basic.pause(10)
        let value = temp_i2cread(1);
        for (let i = 0; i < 10; i++) {
            if ((value[0] & 0x80) != 0x80) {
                basic.pause(20);
                value = temp_i2cread(1);
            }
            else
                break;
        }
    }

    function readTempHumi(select: Temp_humi): number {
        let cnt: number = 0;
        while (!GetInitStatus() && cnt < 10) {
            basic.pause(20);
            cnt++;
        }
        getAc();
        let buf = temp_i2cread(6);
        if (buf.length != 6) {
            // serial.writeLine("444444")
            return 0;
        }
        let humiValue: number = 0;
        humiValue = (humiValue | buf[1]) << 8;
        humiValue = (humiValue | buf[2]) << 8;
        humiValue = humiValue | buf[3];
        humiValue = humiValue >> 4;
        let tempValue: number = 0;
        tempValue = (tempValue | buf[3]) << 8;
        tempValue = (tempValue | buf[4]) << 8;
        tempValue = tempValue | buf[5];
        tempValue = tempValue & 0xfffff;

        tempValue = tempValue * 200 * 10 / 1024 / 1024 - 500;
        tempValue = Math.round(tempValue / 10);
        if (tempValue != 0)
            temperature = tempValue;

        humiValue = humiValue * 1000 / 1024 / 1024;
        humiValue = Math.round(humiValue / 10);
        if (humiValue != 0)
            airhumidity = humiValue;

        if (select == Temp_humi.Temperature) {
            return temperature;
        }
        else {
            return airhumidity;
        }
    }

    /**
      * Get air temperature and humidity sensor value
      */
    //% weight=74 blockId="getTemperature" block="Get air %select value"
    //% subcategory=Sensor     
    export function getTemperature(select: Temp_humi): number {
        return readTempHumi(select);
    }

    /**
      * Get rainwater sensor value
      */
    //% weight=72 blockId="getRainWater" block="Get rainwater value"
    //% subcategory=Sensor     
    export function getRainWater(): number {
        let ad = pins.analogReadPin(AnalogPin.P1);
        return Math.round(mapRGB(ad, 0, 1024, 0, 255));
    }

    const LINE_FOLLOWER_I2C_ADDR = 0x78
    //% weight=70 blockId=line_followers block="Line follower %lineFollowerSensor in %lineColor ?"
    //% inlineInputMode=inline
    //% subcategory=Sensor
    export function line_followers(lineFollowerSensor: LineFollowerSensors, lineColor: LineColor): boolean {
        pins.i2cWriteNumber(LINE_FOLLOWER_I2C_ADDR, 1, NumberFormat.UInt8BE);
        let data = pins.i2cReadNumber(LINE_FOLLOWER_I2C_ADDR, NumberFormat.UInt8BE);
        let status = false;
        switch (lineFollowerSensor) {
            case LineFollowerSensors.S1:
                if (data & 0x01) {
                    if (lineColor == LineColor.Black) {
                        status = true;
                    }
                }
                else {
                    if (lineColor == LineColor.White) {
                        status = true;
                    }
                }
                break;

            case LineFollowerSensors.S2:
                if (data & 0x02) {
                    if (lineColor == LineColor.Black) {
                        status = true;
                    }
                }
                else {
                    if (lineColor == LineColor.White) {
                        status = true;
                    }
                }
                break;

            case LineFollowerSensors.S3:
                if (data & 0x04) {
                    if (lineColor == LineColor.Black) {
                        status = true;
                    }
                }
                else {
                    if (lineColor == LineColor.White) {
                        status = true;
                    }
                }
                break;

            case LineFollowerSensors.S4:
                if (data & 0x08) {
                    if (lineColor == LineColor.Black) {
                        status = true;
                    }
                }
                else {
                    if (lineColor == LineColor.White) {
                        status = true;
                    }
                }
                break;
        }
        return status;
    }

    /**
      * Get battery voltage value
      */
    //% weight=68 blockId="getBatteryVoltage" block="Get battery voltage (mV)"
    //% subcategory=Sensor     
    export function getBatteryVoltage(): number {
        return batVoltage;
    }

    function i2cread(adress: number, reg: number): number {
        pins.i2cWriteNumber(adress, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(adress, NumberFormat.UInt8BE);
        return val;
    }

    const Sonar_I2C_ADDR = 0x77;

    //% weight=67 blockId=GETDISTANCE block="Get Distance (cm)"
    //% subcategory=Sensor
    export function GETDISTANCE(): number {
        let distance = i2cread(Sonar_I2C_ADDR, 0) + i2cread(Sonar_I2C_ADDR, 1) * 256;
        if (distance > 65500)
            distance = 0
        return Math.round(distance / 10);
    }

    //% weight=66 blockId=setUltrasonicColor block="Set Ultrasonic sensor color %rgb"
    //% subcategory=Sensor blockGap=50
    export function setUltrasonicColor(rgb: RGBColors) {
        let tureRgb = 0;
        switch (rgb)
        {
            case RGBColors.Red:
                tureRgb = 0xFF0000;
                break;    

            case RGBColors.Orange:
                tureRgb = 0xFFA500;    
                break;    

            case RGBColors.Yellow:
                tureRgb = 0xFFFF00;
                break;    
                
            case RGBColors.Green:
                tureRgb = 0x00FF00;    
                break;    

                case RGBColors.Blue:
                tureRgb = 0x0000FF;
                break;    
                
            case RGBColors.Indigo:
                tureRgb = 0x4b0082;    
                break;    

            case RGBColors.Violet:
                tureRgb = 0x8a2be2;
                break;    
                
            case RGBColors.Purple:
                tureRgb = 0xFF00FF;    
                break;   

            case RGBColors.White:
                tureRgb = 0xFFFFFF;    
                break;   
        }
        let buf2 = pins.createBuffer(7);
        buf2[0] = 2;
        buf2[1] = 0;
        pins.i2cWriteBuffer(Sonar_I2C_ADDR, buf2)
        let buf = pins.createBuffer(7);
        buf[0] = 3;
        buf[1] = (tureRgb >> 16) & 0xff;
        buf[2] = (tureRgb >> 8) & 0xff;
        buf[3] = tureRgb & 0xff;
        buf[4] = (tureRgb >> 16) & 0xff;
        buf[5] = (tureRgb >> 8) & 0xff;
        buf[6] = tureRgb & 0xff;
        pins.i2cWriteBuffer(Sonar_I2C_ADDR, buf)
    }

    export enum Colors {
        //% block="Red"
        Red = 0x01,
        //% block="Green"
        Green = 0x02,
        //% block="Blue"
        Blue = 0x03,
        //% block="Black"
        Black = 0x04,
        //% block="White"
        White = 0x05,
        //% block="None"
        None = 0x06
    }

    export enum RGBValue {
        //% block="Red"
        Red = 0x01,
        //% block="Green"
        Green = 0x02,
        //% block="Blue"
        Blue = 0x03  
    }


    const APDS9960_I2C_ADDR = 0x39;
    const APDS9960_ID_1 = 0xA8;
    const APDS9960_ID_2 = 0x9C;
    /* APDS-9960 register addresses */
    const APDS9960_ENABLE = 0x80;
    const APDS9960_ATIME = 0x81;
    const APDS9960_WTIME = 0x83;
    const APDS9960_AILTL = 0x84;
    const APDS9960_AILTH = 0x85;
    const APDS9960_AIHTL = 0x86;
    const APDS9960_AIHTH = 0x87;
    const APDS9960_PERS = 0x8C;
    const APDS9960_CONFIG1 = 0x8D;
    const APDS9960_PPULSE = 0x8E;
    const APDS9960_CONTROL = 0x8F;
    const APDS9960_CONFIG2 = 0x90;
    const APDS9960_ID = 0x92;
    const APDS9960_STATUS = 0x93;
    const APDS9960_CDATAL = 0x94;
    const APDS9960_CDATAH = 0x95;
    const APDS9960_RDATAL = 0x96;
    const APDS9960_RDATAH = 0x97;
    const APDS9960_GDATAL = 0x98;
    const APDS9960_GDATAH = 0x99;
    const APDS9960_BDATAL = 0x9A;
    const APDS9960_BDATAH = 0x9B;
    const APDS9960_POFFSET_UR = 0x9D;
    const APDS9960_POFFSET_DL = 0x9E;
    const APDS9960_CONFIG3 = 0x9F;
    const APDS9960_GCONF4 = 0xAB;
    const APDS9960_AICLEAR = 0xE7;


    /* LED Drive values */
    const LED_DRIVE_100MA = 0;

    /* ALS Gain (AGAIN) values */
    const AGAIN_4X = 1;

    /* Default values */
    const DEFAULT_ATIME = 219;    // 103ms
    const DEFAULT_WTIME = 246;    // 27ms
    const DEFAULT_PROX_PPULSE = 0x87;    // 16us, 8 pulses
    const DEFAULT_POFFSET_UR = 0;       // 0 offset
    const DEFAULT_POFFSET_DL = 0;       // 0 offset      
    const DEFAULT_CONFIG1 = 0x60;    // No 12x wait (WTIME) factor
    const DEFAULT_AILT = 0xFFFF;  // Force interrupt for calibration
    const DEFAULT_AIHT = 0;
    const DEFAULT_PERS = 0x11;    // 2 consecutive prox or ALS for int.
    const DEFAULT_CONFIG2 = 0x01;    // No saturation interrupts or LED boost  
    const DEFAULT_CONFIG3 = 0;       // Enable all photodiodes, no SAI
    const DEFAULT_LDRIVE = LED_DRIVE_100MA;
    const DEFAULT_AGAIN = AGAIN_4X;

    const OFF = 0;
    const POWER = 0;
    const AMBIENT_LIGHT = 1;
    const ALL = 7;

    const red_wb = 2130;
    const green_wb = 3500;
    const blue_wb = 4620;

    function rgb_i2cwrite(reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(APDS9960_I2C_ADDR, buf);
    }

    function rgb_i2cread(reg: number): number {
        pins.i2cWriteNumber(APDS9960_I2C_ADDR, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(APDS9960_I2C_ADDR, NumberFormat.UInt8BE);
        return val;
    }

    function InitColor(): boolean {
        let id = rgb_i2cread(APDS9960_ID);
        setMode(ALL, OFF);
        rgb_i2cwrite(APDS9960_ATIME, DEFAULT_ATIME);
        rgb_i2cwrite(APDS9960_WTIME, DEFAULT_WTIME);
        rgb_i2cwrite(APDS9960_PPULSE, DEFAULT_PROX_PPULSE);
        rgb_i2cwrite(APDS9960_POFFSET_UR, DEFAULT_POFFSET_UR);
        rgb_i2cwrite(APDS9960_POFFSET_DL, DEFAULT_POFFSET_DL);
        rgb_i2cwrite(APDS9960_CONFIG1, DEFAULT_CONFIG1);
        setLEDDrive(DEFAULT_LDRIVE);
        setAmbientLightGain(DEFAULT_AGAIN);
        setLightIntLowThreshold(DEFAULT_AILT);
        setLightIntHighThreshold(DEFAULT_AIHT);
        rgb_i2cwrite(APDS9960_PERS, DEFAULT_PERS);
        rgb_i2cwrite(APDS9960_CONFIG2, DEFAULT_CONFIG2);
        rgb_i2cwrite(APDS9960_CONFIG3, DEFAULT_CONFIG3);
        return true;
    }

    function setLEDDrive(drive: number) {
        let val = rgb_i2cread(APDS9960_CONTROL);
        /* Set bits in register to given value */
        drive &= 0b00000011;
        drive = drive << 6;
        val &= 0b00111111;
        val |= drive;
        rgb_i2cwrite(APDS9960_CONTROL, val);
    }

    function setLightIntLowThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        rgb_i2cwrite(APDS9960_AILTL, val_low);
        rgb_i2cwrite(APDS9960_AILTH, val_high);
    }

    function setLightIntHighThreshold(threshold: number) {
        let val_low = threshold & 0x00FF;
        let val_high = (threshold & 0xFF00) >> 8;
        rgb_i2cwrite(APDS9960_AIHTL, val_low);
        rgb_i2cwrite(APDS9960_AIHTH, val_high);
    }


    function rgb2hue(r: number, g: number, b: number): number {
        let max = Math.max(r, Math.max(g, b))
        let min = Math.min(r, Math.min(g, b))
        let c = max - min;
        let hue = 0;
        let segment = 0;
        let shift = 0;
        if (c == 0)
            return 0;
        if ((r > g) && (r > b)) {
            segment = (60.0 * (g - b)) / c;
            if (segment < 0)
                hue = segment + 360;
        }
        else if ((g > b) && (g > r)) {
            segment = (60.0 * (b - r)) / c;
            hue = segment + 120;
        }
        else if ((b > g) && (b > r)) {
            segment = (60.0 * (r - g)) / c;
            hue = segment + 240;
        }
        return hue;
    }

    function setMode(mode: number, enable: number) {
        let reg_val = getMode();
        /* Change bit(s) in ENABLE register */
        enable = enable & 0x01;
        if (mode >= 0 && mode <= 6) {
            if (enable > 0) {
                reg_val |= (1 << mode);
            }
            else {
                //reg_val &= ~(1 << mode);
                reg_val &= (0xff - (1 << mode));
            }
        }
        else if (mode == ALL) {
            if (enable > 0) {
                reg_val = 0x7F;
            }
            else {
                reg_val = 0x00;
            }
        }
        rgb_i2cwrite(APDS9960_ENABLE, reg_val);
    }

    function getMode(): number {
        let enable_value = rgb_i2cread(APDS9960_ENABLE);
        return enable_value;
    }

    function enableLightSensor(interrupts: boolean) {
        setAmbientLightGain(DEFAULT_AGAIN);
        if (interrupts) {
            setAmbientLightIntEnable(1);
        }
        else {
            setAmbientLightIntEnable(0);
        }
        enablePower();
        setMode(AMBIENT_LIGHT, 1);
    }

    function setAmbientLightGain(drive: number) {
        let val = rgb_i2cread(APDS9960_CONTROL);
        /* Set bits in register to given value */
        drive &= 0b00000011;
        val &= 0b11111100;
        val |= drive;
        rgb_i2cwrite(APDS9960_CONTROL, val);
    }

    function getAmbientLightGain(): number {
        let val = rgb_i2cread(APDS9960_CONTROL);
        val &= 0b00000011;
        return val;
    }

    function enablePower() {
        setMode(POWER, 1);
    }

    function setAmbientLightIntEnable(enable: number) {
        let val = rgb_i2cread(APDS9960_ENABLE);
        /* Set bits in register to given value */
        enable &= 0b00000001;
        enable = enable << 4;
        val &= 0b11101111;
        val |= enable;
        rgb_i2cwrite(APDS9960_ENABLE, val);
    }
    /**
	 *  Color sensor return the color.
	 */
    //% weight=62 blockId=checkCurrentColor block="Current color is %color"
    //% subcategory=Sensor
    export function checkCurrentColor(color: Colors): boolean {
        let c = rgb_i2cread(APDS9960_CDATAL) + rgb_i2cread(APDS9960_CDATAH) * 256;
        let r = rgb_i2cread(APDS9960_RDATAL) + rgb_i2cread(APDS9960_RDATAH) * 256;
        let g = rgb_i2cread(APDS9960_GDATAL) + rgb_i2cread(APDS9960_GDATAH) * 256;
        let b = rgb_i2cread(APDS9960_BDATAL) + rgb_i2cread(APDS9960_BDATAH) * 256;

        if (r > red_wb)
            r = red_wb;
        if (g > green_wb)
            g = green_wb;
        if (b > blue_wb)
            b = blue_wb;

        r = Math.round(mapRGB(r, 0, red_wb, 0, 255));
        g = Math.round(mapRGB(g, 0, green_wb, 0, 255));
        b = Math.round(mapRGB(b, 0, blue_wb, 0, 255));

        let hsv = rgb2hue(r, g, b)
        let t = Colors.None;
        if (c > 2200 && r > 65 && g > 65 && b > 65) {
            t = Colors.White;
        }
        else if (c > 800) {
            if (hsv < 8 || hsv > 350)
                t = Colors.Red;
            else if (hsv > 60 && hsv < 170) {
                t = Colors.Green;
            }
            else if (hsv > 195 && hsv < 230) {
                t = Colors.Blue;
            }
        }
        else if (c > 200 && r > 10 && g > 7 && b > 7 && r < 16.5 && g < 15 && b < 14) {
            t = Colors.Black;
        }
        return (color == t);
    }

    /**
	 *  Color sensor return the color.
	 */
    //% weight=60 blockId=get_color block="color %color value(0~255)"
    //% subcategory=Sensor
    export function get_color(color: RGBValue): number {
        let value = 0;
        let r = rgb_i2cread(APDS9960_RDATAL) + rgb_i2cread(APDS9960_RDATAH) * 256;
        let g = rgb_i2cread(APDS9960_GDATAL) + rgb_i2cread(APDS9960_GDATAH) * 256;
        let b = rgb_i2cread(APDS9960_BDATAL) + rgb_i2cread(APDS9960_BDATAH) * 256;

        if (r > red_wb)
            r = red_wb;
        if (g > green_wb)
            g = green_wb;
        if (b > blue_wb)
            b = blue_wb;

        r = Math.round(mapRGB(r, 0, red_wb, 0, 255));
        g = Math.round(mapRGB(g, 0, green_wb, 0, 255));
        b = Math.round(mapRGB(b, 0, blue_wb, 0, 255));

        switch (color)
        {
            case RGBValue.Red:
                value = r;
                break;
            
            case RGBValue.Green:
                value = g;
                break;
            
            case RGBValue.Blue:
                value = b;
                break;
        }
        return value;
    }

     /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="boardRGBsetBrightness" block="set board RGB light brightness %brightness"
    //% weight=66
    //% subcategory=LED
    export function boardRGBsetBrightness(brightness: number): void {
        boardRgbLight.setBrightness(brightness);
    }

    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=65 blockId=setBoardPixelRGB block="Set board RGB|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setBoardPixelRGB(lightoffset: Lights, rgb: RGBColors) {
        boardRgbLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=64 blockId=setBoardPixelRGBArgs block="Set board RGB|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setBoardPixelRGBArgs(lightoffset: Lights, rgb: number) {
        boardRgbLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=63 blockId=showBoardLight block="Show board RGB light"
    //% subcategory=LED
    export function showBoardLight() {
        boardRgbLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=62 blockGap=50 blockId=clearBoardLight block="Clear board RGB light"
    //% subcategory=LED
    export function clearBoardLight() {
        boardRgbLight.clear();
    }

    /**
     * Initialize RGB
     */
    function initRGBLight() {
        if (!rgbLight) {
            rgbLight = RGBLight.create(DigitalPin.P13, 2, RGBPixelMode.RGB);
        }
        clearLight();
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="setBrightness" block="set light brightness %brightness"
    //% weight=60
    //% subcategory=LED
    export function setBrightness(brightness: number): void {
        rgbLight.setBrightness(brightness);
    }

    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=58 blockId=setPixelRGB block="Set|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setPixelRGB(lightoffset: Lights, rgb: RGBColors) {
        rgbLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=56 blockId=setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setPixelRGBArgs(lightoffset: Lights, rgb: number) {
        rgbLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=54 blockId=showLight block="Show light"
    //% subcategory=LED
    export function showLight() {
        rgbLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=52 blockGap=50 blockId=clearLight block="Clear light"
    //% subcategory=LED
    export function clearLight() {
        rgbLight.clear();
    }

    let WIFI_MODE_ADRESS = 0x69

    /**
     * set wifi module STA module
    */
    //% weight=48 blockId=setWifiSTAmodule block="Set wifi module to STA mode"
    //% subcategory=Communication
    // export function setWifiSTAmodule() {
    // }

    function updateTempHumi() {
        readTempHumi(Temp_humi.Temperature);
    }

    //% weight=46 blockId=setWiFiAPMode block="Set Wifi AP mode"
    //% subcategory=Communication
    export function setWiFiAPMode() {
        let cmdStr = "L0$";
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
    }
    /**
     * Send the sensors data
     */
    //% weight=44 blockId=sendSensorData block="Send sensors data to wifi module"
    //% subcategory=Communication
    export function sendSensorData() {
        updateTempHumi();
        let cmdStr: string = "A";
        cmdStr += (tempHumiPort != INVALID_PORT ? temperature : 'NO');
        cmdStr += '|';
        cmdStr += (tempHumiPort != INVALID_PORT ? airhumidity : 'NO');
        cmdStr += '|';
        cmdStr += (rainwaterPort != INVALID_PORT ? getRainWater() : 'NO');
        cmdStr += '$';
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
    }
    /**
    * get data from wifi
    */
    //% weight=42 blockId=getDatafromWifi block="Get data buffer from wifi module"
    //% subcategory=Communication
    //% blockGap=50 
    export function getDatafromWifi(): Buffer {
        return removeValueFromBuffer(pins.i2cReadBuffer(WIFI_MODE_ADRESS, 4), 0xd3);
    }

    /**
 * set wifi module connect to router, only valid in STA mode
 * @param ssid is a string, eg: "iot"
 * @param password is a string, eg: "12345678"
*/
    //% weight=40 blockId=setWifiConnectToRouter block="Set wifi module connect to router, wifi name %ssid and password %password"
    //% subcategory=Communication
    export function setWifiConnectToRouter(ssid: string, password: string) {
        let cmdStr: string = "I"
        cmdStr += ssid;
        cmdStr += '|||'
        cmdStr += password;
        cmdStr += "$$$";
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
    }

    //% weight=38 blockId=wifiIsConnected block="Is wifi connected ?"
    //% subcategory=Communication
    export function wifiIsConnected(): boolean {
        let cmdStr = "J0$";
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
        let val = pins.i2cReadBuffer(WIFI_MODE_ADRESS, 3);
        if (val[0] == 0x4A && val[1] == 1)
            return true;
        else
            return false;
    }

    /**
    * Connect to ThingSpeak and upload data. It would not upload anything if it failed to connect to Wifi or ThingSpeak.
    */
    //% weight=36 blockId=connectThingSpeak block="Upload data to ThingSpeak Write key = %write_api_key|Field 1 = %n1||Field 2 = %n2|Field 3 = %n3|Field 4 = %n4|Field 5 = %n5|Field 6 = %n6|Field 7 = %n7 Field 8 = %n8"
    //% ip.defl=api.thingspeak.com
    //% write_api_key.defl=your_write_api_key
    //% expandableArgumentMode="enabled" subcategory=Communication
    export function connectThingSpeak(write_api_key: string, n1?: number, n2?: number, n3?: number, n4?: number, n5?: number, n6?: number, n7?: number, n8?: number) {
        if (write_api_key != "") {
            let hasData = false;
            let cmdStr = "K" + write_api_key;
            if (n1 != undefined) {
                cmdStr += "|1|";
                cmdStr += n1.toString();
                hasData = true;
            }
            if (n2 != undefined) {
                cmdStr += "|2|";
                cmdStr += n2.toString();
                hasData = true;
            }
            if (n3 != undefined) {
                cmdStr += "|3|";
                cmdStr += n3.toString();
                hasData = true;
            }
            if (n4 != undefined) {
                cmdStr += "|4|";
                cmdStr += n4.toString();
                hasData = true;
            }
            if (n5 != undefined) {
                cmdStr += "|5|";
                cmdStr += n5.toString();
                hasData = true;
            }
            if (n6 != undefined) {
                cmdStr += "|6|";
                cmdStr += n6.toString();
                hasData = true;
            }
            if (n7 != undefined) {
                cmdStr += "|7|";
                cmdStr += n7.toString();
                hasData = true;
            }
            if (n8 != undefined) {
                cmdStr += "|8|";
                cmdStr += n8.toString();
                hasData = true;
            }
            cmdStr += '$'
            serial.writeLine(cmdStr);
            let data = pins.createBuffer(cmdStr.length);
            for (let i = 0; i <= cmdStr.length - 1; i++) {
                data[i] = cmdStr.charCodeAt(i)
            }
            if (hasData) {
                pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
            }

        }
    }

    /**
    * get data from thingspeak
    * @param fieldId is a string, eg: "6"
    */
    //% weight=34 blockId=getDatafromThingspeak block="Get ThingSpeak field Id %fieldId data channel id %channelId and read key %readKey"
    //% subcategory=Communication
    export function getDatafromThingspeak(fieldId: string, channelId: string, readKey: string): string {
        let cmdStr = "M" + channelId + "|" + readKey + "|" + fieldId + "$";
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
        let received = pins.i2cReadBuffer(WIFI_MODE_ADRESS, 80)
        let receivedStr = received.toString();
        serial.writeString("data1:")
        serial.writeLine(receivedStr)
        let pos = receivedStr.indexOf("field" + fieldId);
        pos = receivedStr.indexOf(":", pos);
        let value = receivedStr.substr(pos + 2, 3)
        serial.writeString("data2:")
        serial.writeLine(value)
        return value;
    }

    function removeValueFromBuffer(buf: Buffer, value: number): Buffer {
        let count = 0;
        for (let i = 0; i < buf.length; i++) if (buf[i] !== value) count++;
        const result = pins.createBuffer(count);
        let index = 0;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] !== value) result.setNumber(NumberFormat.UInt8LE, index++, buf[i]);
        }
        return result;
    }
}
