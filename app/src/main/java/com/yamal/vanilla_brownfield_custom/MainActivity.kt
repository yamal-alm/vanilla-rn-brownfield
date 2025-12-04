package com.yamal.vanilla_brownfield_custom

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.yamal.vanilla_brownfield_custom.another.AnotherReactActivity
import com.yamal.vanilla_brownfield_custom.camera.CameraActivity
import com.yamal.vanilla_brownfield_custom.helloworld.HelloWorldReactActivity
import com.yamal.vanilla_brownfield_custom.ui.theme.VanillabrownfieldcustomTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            VanillabrownfieldcustomTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize()
                ) { innerPadding ->
                    Column(
                        modifier = Modifier
                            .padding(innerPadding)
                            .fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Button(
                            onClick = {
                                val intent = Intent(this@MainActivity, HelloWorldReactActivity::class.java)
                                startActivity(intent)
                            }
                        ) {
                            Text(
                                text = "Open a React Native Screen",
                            )
                        }

                        Button(
                            onClick = {
                                val intent = Intent(this@MainActivity, AnotherReactActivity::class.java)
                                startActivity(intent)
                            }
                        ) {
                            Text(
                                text = "Open another React Native Screen",
                            )
                        }

                        Button(
                            onClick = {
                                val intent = Intent(this@MainActivity, CameraActivity::class.java)
                                startActivity(intent)
                            }
                        ) {
                            Text(
                                text = "Open React Camera",
                            )
                        }
                    }
                }
            }
        }
    }
}
