using System;
using System.Windows.Automation;

namespace UIAMonitor
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("{\"type\": \"MonitorStarted\", \"status\": \"Ready\"}");

            // Listen for focus changes
            AutomationFocusChangedEventHandler focusHandler = new AutomationFocusChangedEventHandler(OnFocusChanged);
            Automation.AddAutomationFocusChangedEventHandler(focusHandler);

            // Keep the application running
            while (true)
            {
                System.Threading.Thread.Sleep(100);
            }
        }

        private static void OnFocusChanged(object sender, AutomationEventArgs e)
        {
            try
            {
                AutomationElement element = sender as AutomationElement;
                if (element != null)
                {
                    var bounds = element.Current.BoundingRectangle;
                    var payload = new System.Collections.Generic.Dictionary<string, object>
                    {
                        { "type", "FocusChanged" },
                        { "automationId", element.Current.AutomationId },
                        { "name", element.Current.Name },
                        { "className", element.Current.ClassName },
                        { "controlType", element.Current.ControlType.ProgrammaticName },
                        { "bounds", new System.Collections.Generic.Dictionary<string, double>
                            {
                                { "x", bounds.X },
                                { "y", bounds.Y },
                                { "width", bounds.Width },
                                { "height", bounds.Height }
                            }
                        }
                    };

                    var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                    Console.WriteLine(serializer.Serialize(payload));
                }
            }
            catch (Exception ex)
            {
                // Ignore exceptions caused by elements disappearing or access denied
                // Console.Error.WriteLine(ex.Message);
            }
        }
    }
}
