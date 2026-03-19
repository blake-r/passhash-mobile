#!/bin/bash

# =============================================================================
# Qt Migration Test Script
# =============================================================================
# Автоматический скрипт для тестирования миграции из Qt версии в React Native
#
# Использование: ./scripts/test-qt-migration.sh
# =============================================================================

set -e

# Configuration
ADB="/Users/blake-r/projects/tools/android-sdk/platform-tools/adb"
ANDROID_HOME="/Users/blake-r/projects/tools/android-sdk"
PACKAGE_NAME="ru.co_dev.passhash"

# Keystore для подписи (тот же что и для Qt версии)
KEYSTORE_PATH="/Users/blake-r/projects/QtProjects/android_release.keystore"
KEYSTORE_ALIAS="oleg blednov"
KEYSTORE_PASSWORD="1234567890"

# Qt Legacy APK (пре-билд из Qt Creator)
QT_LEGACY_APK="/Users/blake-r/projects/QtProjects/build-passhash-mobile-Android_Qt_5_15_2_Clang_Multi_Abi_d51c04-Release/android-build/build/outputs/apk/release/android-build-release-signed.apk"

# React Native build outputs
RN_RELEASE_AAB="/Users/blake-r/projects/reactnative/passhash-mobile/android/app/build/outputs/bundle/release/app-release.aab"
RN_DEBUG_APK_DIR="/Users/blake-r/projects/reactnative/passhash-mobile/android/app/build/outputs/apk/debug"

# Лог файл
LOG_DIR="/Users/blake-r/projects/reactnative/passhash-mobile/scripts"
LOG_FILE="$LOG_DIR/qt-migration-$(date +%Y%m%d-%H%M%S).log"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Собрать debug APK для тестирования
build_debug_apk() {
    print_header "Сборка Debug APK"
    
    log_info "Собираем debug APK..."
    cd /Users/blake-r/projects/reactnative/passhash-mobile
    
    if npx expo run:android --variant debug 2>&1 | tee /tmp/build_debug.log; then
        log_success "Debug APK собран!"
        # Находим собранный APK
        local debug_apk=$(find android/app/build/outputs/apk/debug -name "*.apk" -type f 2>/dev/null | head -1)
        if [ -n "$debug_apk" ]; then
            log_info "APK находится: $debug_apk"
        fi
    else
        log_error "Сборка debug APK не удалась"
        exit 1
    fi
}

# Проверка подключения устройства
check_device() {
    local device_count=$($ADB devices 2>/dev/null | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')
    if [ "$device_count" -eq 0 ]; then
        log_error "Нет подключенного устройства!"
        echo ""
        echo "Подключите устройство по USB и включите USB debugging."
        echo "Затем запустите скрипт снова."
        exit 1
    fi
    log_success "Устройство подключено!"
}

# Проверка наличия APK файлов
check_apks() {
    local missing=0
    
    if [ ! -f "$QT_LEGACY_APK" ]; then
        log_error "Qt Legacy APK не найден: $QT_LEGACY_APK"
        missing=1
    fi
    
    # Проверяем наличие AAB или debug APK
    local rn_artifact=""
    if [ -f "$RN_RELEASE_AAB" ]; then
        rn_artifact="$RN_RELEASE_AAB"
        log_info "Найден React Native AAB: $rn_artifact"
        log_warning "AAB требует bundletool для установки на устройство"
    elif [ -d "$RN_DEBUG_APK_DIR" ]; then
        local debug_apk=$(find "$RN_DEBUG_APK_DIR" -name "*.apk" -type f 2>/dev/null | head -1)
        if [ -n "$debug_apk" ]; then
            rn_artifact="$debug_apk"
            log_info "Найден React Native Debug APK: $rn_artifact"
        fi
    fi
    
    if [ -z "$rn_artifact" ]; then
        log_error "React Native артефакт не найден"
        log_info "Сначала выполните: npm run android:release"
        log_info "Или соберите debug версию: npx expo run:android --variant debug"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        exit 1
    fi
    
    log_success "Все артефакты найдены!"
}

# Удаление старой версии
uninstall_old_version() {
    print_header "Шаг 1: Удаление старой версии"
    
    log_info "Удаляем старую версию приложения..."
    if $ADB uninstall "$PACKAGE_NAME" 2>/dev/null; then
        log_success "Старая версия удалена"
    else
        log_warning "Приложение не было установлено (это нормально)"
    fi
}

# Установка Qt Legacy версии
install_qt_legacy() {
    print_header "Шаг 2: Установка Qt Legacy версии"
    
    log_info "Устанавливаем Qt Legacy версию..."
    if $ADB install -r "$QT_LEGACY_APK" 2>&1 | tee /tmp/install_qt.log | grep -q "Success"; then
        log_success "Qt Legacy версия установлена"
    else
        log_error "Ошибка установки Qt Legacy версии"
        cat /tmp/install_qt.log
        exit 1
    fi
}

# Запуск Qt версии для ввода данных
setup_qt_data() {
    print_header "Шаг 3: Настройка данных в Qt версии"
    
    log_info "Запускаем Qt версию..."
    $ADB shell am start -n "$PACKAGE_NAME/.MainActivity" 2>/dev/null || true
    
    echo ""
    log_info "=== ВАЖНО: Введите тестовые данные ==="
    echo ""
    echo "1. Введите Site Tag (например: test.com)"
    echo "2. Введите Master Key (например: mypassword123)"
    echo "3. Нажмите 'Generate' для генерации пароля"
    echo "4. Нажмите 'Save to Keeper' для сохранения"
    echo "5. Можете сохранить несколько записей"
    echo ""
    log_warning "Не закрывайте приложение полностью - просто сверните!"
    echo ""
    read -p "Нажмите Enter, когда закончите ввод данных..."
}

# Установка React Native версии
install_rn_version() {
    print_header "Шаг 4: Установка React Native версии"

    # Для миграции нужно собрать APK с тем же ключом, что и Qt версия
    # Используем signed APK из release сборки
    
    # Проверяем наличие signed APK или AAB
    local rn_signed_apk=""
    if [ -f "$RN_RELEASE_AAB" ]; then
        # AAB требует bundletool, но нужен ключ подписи
        log_info "Найден AAB, собираем signed APK для установки..."
        
        # Собираем signed APK из AAB с правильным ключом
        local apks_file="/tmp/app-release.apks"
        rm -f "$apks_file"
        export ANDROID_HOME="$ANDROID_HOME"
        
        log_info "Генерируем APK Set из AAB с подписью..."
        local build_result=0
        bundletool build-apks \
            --bundle="$RN_RELEASE_AAB" \
            --output="$apks_file" \
            --mode=universal \
            --ks="$KEYSTORE_PATH" \
            --ks-key-alias="$KEYSTORE_ALIAS" \
            --ks-pass="pass:$KEYSTORE_PASSWORD" \
            --key-pass="pass:$KEYSTORE_PASSWORD" \
            2>&1 | tee /tmp/build_apks.log || build_result=$?
        
        if [ $build_result -ne 0 ]; then
            log_error "Ошибка создания APK Set"
            cat /tmp/build_apks.log
            exit 1
        fi
        
        log_info "Извлекаем и устанавливаем universal APK..."
        rm -rf /tmp/apks_extract
        if unzip -q "$apks_file" -d /tmp/apks_extract && \
           $ADB install -r /tmp/apks_extract/universal.apk 2>&1 | tee /tmp/install_rn.log | grep -q "Success"; then
            log_success "React Native версия установлена"
        else
            log_error "Ошибка установки APK"
            cat /tmp/install_rn.log
            exit 1
        fi
    elif [ -d "$RN_DEBUG_APK_DIR" ]; then
        rn_signed_apk=$(find "$RN_DEBUG_APK_DIR" -name "*.apk" -type f 2>/dev/null | head -1)
        if [ -n "$rn_signed_apk" ]; then
            log_info "Устанавливаем debug APK: $rn_signed_apk"
            if $ADB install -r -t "$rn_signed_apk" 2>&1 | tee /tmp/install_rn.log | grep -q "Success"; then
                log_success "React Native версия установлена"
            else
                log_error "Ошибка установки debug APK"
                cat /tmp/install_rn.log
                exit 1
            fi
        else
            log_error "Debug APK не найден"
            exit 1
        fi
    else
        log_error "React Native артефакт не найден!"
        log_info "Сначала выполните: npm run android:release"
        exit 1
    fi
}

# Запуск React Native версии и миграция
run_migration() {
    print_header "Шаг 5: Запуск миграции"
    
    log_info "Запускаем React Native версию..."
    $ADB shell am start -n "$PACKAGE_NAME/.MainActivity" 2>/dev/null || true
    
    echo ""
    log_info "=== Проверка миграции ==="
    echo ""
    echo "1. Приложение должно автоматически обнаружить Qt данные"
    echo "2. Должно появиться предложение выполнить миграцию"
    echo "3. Подтвердите миграцию"
    echo "4. Проверьте, что настройки перенеслись:"
    echo "   - Длина пароля"
    echo "   - Требования (цифры, спецсимволы, регистр)"
    echo "   - Сохранённые записи в Keeper"
    echo ""
    read -p "Нажмите Enter, когда проверите миграцию..."
}

# Снятие логов
capture_logs() {
    print_header "Шаг 6: Снятие логов миграции"
    
    log_info "Снимаем логи миграции..."
    
    # Снимаем logcat за последние 2 минуты
    $ADB logcat -d --pid=$($ADB shell pidof "$PACKAGE_NAME" 2>/dev/null | tr -d '\r') 2>/dev/null | \
        grep -i "qtmigration" > "$LOG_FILE" || true
    
    # Если не получилось по PID, снимаем все логи с тегом QtMigration
    if [ ! -s "$LOG_FILE" ]; then
        $ADB logcat -d 2>/dev/null | grep -i "QtMigration" > "$LOG_FILE" || true
    fi
    
    # Добавляем общую информацию
    {
        echo ""
        echo "=== APP INFO ==="
        $ADB shell dumpsys package "$PACKAGE_NAME" 2>/dev/null | grep -E "versionName|versionCode" || echo "Could not get app info"
        
        echo ""
        echo "=== QT CONFIG FILE ==="
        $ADB shell "run-as $PACKAGE_NAME cat files/.config/Oleg\ Blednov/Password\ Hasher.conf 2>/dev/null" || echo "Config file not found or not accessible"
        
        echo ""
        echo "=== ASYNCSTORAGE CONTENTS ==="
        $ADB shell "run-as $PACKAGE_NAME cat databases/RKStorage 2>/dev/null" | head -100 || echo "Could not read AsyncStorage"
    } >> "$LOG_FILE"
    
    log_success "Логи сохранены в: $LOG_FILE"
    echo ""
    
    # Показываем последние 50 строк логов
    log_info "=== Последние логи миграции ==="
    tail -50 "$LOG_FILE"
}

# Проверка результатов
check_results() {
    print_header "Проверка результатов миграции"
    
    log_info "Проверяем данные в AsyncStorage..."
    
    # Проверяем наличие настроек
    local has_digits=$($ADB shell "run-as $PACKAGE_NAME cat databases/RKStorage 2>/dev/null" | grep -o '"Requirements.digits":"[^"]*"' || echo "")
    local has_keeper=$($ADB shell "run-as $PACKAGE_NAME cat databases/RKStorage 2>/dev/null" | grep -o '"Keeper.data":"[^"]*"' || echo "")
    
    if [ -n "$has_digits" ]; then
        log_success "✓ Requirements.digits найден: $has_digits"
    else
        log_warning "✗ Requirements.digits не найден"
    fi
    
    if [ -n "$has_keeper" ]; then
        log_success "✓ Keeper.data найден"
    else
        log_warning "✗ Keeper.data не найден"
    fi
}

# Главная функция
main() {
    print_header "Qt Migration Test Script"
    echo "Дата: $(date)"
    echo "Лог файл: $LOG_FILE"
    echo ""
    
    # Парсинг аргументов
    local build_debug=false
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-debug) build_debug=true; shift ;;
            --help)
                echo "Qt Migration Testing Script"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --build-debug   Собрать debug APK перед тестом"
                echo "  --help          Показать эту справку"
                echo ""
                echo "Quick Start:"
                echo "  # Запустить тест (нужен bundletool для AAB):"
                echo "  $0"
                echo ""
                echo "  # Собрать debug APK и запустить тест:"
                echo "  $0 --build-debug"
                exit 0
                ;;
            *) log_error "Неизвестная опция: $1"; exit 1 ;;
        esac
    done
    
    # Сборка debug APK если запрошено
    if [ "$build_debug" = true ]; then
        build_debug_apk
    fi
    
    check_device
    check_apks
    
    echo ""
    log_warning "ВНИМАНИЕ: Этот скрипт удалит старую версию и установит Qt Legacy!"
    echo ""
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Отменено пользователем"
        exit 0
    fi
    
    uninstall_old_version
    install_qt_legacy
    setup_qt_data
    install_rn_version
    run_migration
    capture_logs
    check_results
    
    print_header "Тестирование завершено!"
    log_success "Логи миграции сохранены в: $LOG_FILE"
    echo ""
    echo "Для просмотра полного лога:"
    echo "  cat $LOG_FILE"
    echo ""
    echo "Для просмотра в реальном времени:"
    echo "  adb logcat | grep -i qtmigration"
}

# Запуск
main "$@"
