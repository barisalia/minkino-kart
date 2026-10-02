import UIKit
import AVFoundation
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        sesOturumunuKur()
        return true
    }

    /// Ses oturumu: oyun sesi calarken mikrofon da dinleyebilsin (playAndRecord). defaultToSpeaker olmadan mikrofon
    /// acilinca ses ahizeye (kulaga) duser; Bluetooth kulaklik/hoparlor (A2DP) cikisi serbest.
    /// Not: gercek iPhone'da ufleme/alkis ile denenmeli (algilama esikleri degismedi).
    private func sesOturumunuKur() {
        let oturum = AVAudioSession.sharedInstance()
        do {
            try oturum.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothA2DP])
            try oturum.setActive(true)
        } catch {
            print("Minkino: ses oturumu kurulamadi: \(error)")
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Arka plana geciste ses, muzik ve mikrofon web tarafinda durur (src/kabuk/yerel.ts → appStateChange).
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Telefon gorusmesi vb. kesintiden sonra kategori degismis olabilir: yeniden kur
        sesOturumunuKur()
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
