import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MinkinoBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// Ekran yonu sayfaya gore web tarafinda ayarlanir (src/kabuk/yon.ts, @capacitor/screen-orientation): iPhone'da genis
/// sahneli oyunlar yatay, menu / Kartlar / Okul / Canlan serbest; iPad serbest (film yatay).
/// Eklentinin 'landscape' kilidi tek yon birakir (landscapeRight ya da landscapeLeft): yatay kilit iki yonlu olsun,
/// cocuk telefonu hangi yana cevirirse ekran duz dursun (dikey yok). Kilit sirasinda telefonun o anki yatay yonu istenir.
class MinkinoBridgeViewController: CAPBridgeViewController {
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        let maske = super.supportedInterfaceOrientations
        if maske == .landscapeLeft || maske == .landscapeRight {
            return .landscape
        }
        return maske
    }
}
