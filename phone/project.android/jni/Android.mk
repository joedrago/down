LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := down_shared

LOCAL_MODULE_FILENAME := libdown

LOCAL_SRC_FILES := down/main.cpp \
                   down/AppDelegate.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/down

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_chipmunk_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_extension_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_localstorage_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_builder_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_studio_static


LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2

include $(BUILD_SHARED_LIBRARY)

$(call import-module,scripting/javascript/bindings)
$(call import-module,scripting/javascript/bindings/chipmunk)
$(call import-module,scripting/javascript/bindings/extension)
$(call import-module,scripting/javascript/bindings/localstorage)
$(call import-module,scripting/javascript/bindings/network)
$(call import-module,scripting/javascript/bindings/cocosbuilder)
$(call import-module,scripting/javascript/bindings/cocostudio)
